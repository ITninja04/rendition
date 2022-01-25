import React from 'react';

import {
	AutoUIAction,
	AutoUIModel,
	AutoUIBaseResource,
	getFieldForFormat,
	AutoUIContext,
	AutoUIRawModel,
	autoUIJsonSchemaPick,
	ActionData,
	Priorities,
} from './schemaOps';
import { ResourceTagModelService } from '../../components/TagManagementModal/tag-management-service';
import { Format } from '../../components/Renderer/types';
import { Dictionary } from '../../common-types';
import { getLenses, LensTemplate } from './Lenses';
import { getFromLocalStorage, setToLocalStorage } from '../../utils';
import { LensSelection } from './Lenses/LensSelection';
import styled from 'styled-components';
import { Flex } from '../../components/Flex';
import { filter } from '../../components/Filters/SchemaSieve';
import { JSONSchema7 as JSONSchema } from 'json-schema';
import isEqual from 'lodash/isEqual';
import { Spinner } from '../../components/Spinner';
import { useTranslation } from '../../hooks/useTranslation';
import { NoRecordsFoundArrow } from './NoRecordsFoundArrow';
import { useHistory } from '../../hooks/useHistory';
import { Filters } from './Filters/Filters';
import { Box, BoxProps } from '../../components/Box';
import { Tags } from './Actions/Tags';
import { Update } from './Actions/Update';
import { notifications } from '../../components/Notifications';
import {
	ResourceTagSubmitInfo,
	SubmitInfo,
} from '../../components/TagManagementModal/models';
import { Create } from './Actions/Create';
import {
	autoUIAddToSchema,
	autoUIDefaultPermissions,
	autoUIGetModelForCollection,
	autoUIRunTransformers,
} from './models/helpers';
import { autoUIGetDisabledReason } from './utils';
import { FocusSearch } from './Filters/FocusSearch';
import { TableColumn } from '../../components/Table';
import { getSelected, getSortingFunction } from './utils';
import { CustomWidget } from './CustomWidget';

const HeaderGrid = styled(Flex)`
	> * {
		&:first-child {
			margin-right: 4px;
		}
		&:not(:last-child):not(:first-child) {
			margin-left: 4px;
			margin-right: 4px;
		}
		&:last-child {
			margin-left: 4px;
		}
	}
`;

export interface AutoUIProps<T> extends BoxProps {
	/** Model is the property that describe the data to display with a JSON structure */
	model: AutoUIModel<T>;
	/** Array of data or data entity to display */
	data: T[] | T | undefined;
	/** Formats are custom widgets to render in the table cell. The type of format to display is described in the model. */
	formats?: Format[];
	/** Actions is an array of actions applicable on the selected items */
	actions?: Array<AutoUIAction<T>>;
	/** The sdk is used to pass the method to handle tags when added removed or updated */
	sdk?: {
		tags?: ResourceTagModelService;
	};
	/** Dictionary of {[column_property]: customFunction} where the customFunction is the function to sort data on column header click */
	customSort?: Dictionary<(a: T, b: T) => number>;
	// TODO: Ideally the base URL is autogenerated, but there are some issues with that currently (eg. instead of application we have apps in the URL)
	/** Redirect on entity click */
	getBaseUrl?: (entry: T) => string;
	/** Method to refresh the rendered data when something is changed */
	refresh?: () => void;
	/** Event emitted on entity click */
	onEntityClick?: (
		entry: T,
		event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) => void;
	/** All the lenses available for this AutoUI component. Any default lenses will automatically be added to this array. */
	customLenses?: LensTemplate[];
	/** Additional context for picking the right lens */
	lensContext?: object;
}

export const AutoUI = <T extends AutoUIBaseResource<T>>({
	model: modelRaw,
	data,
	formats,
	actions,
	sdk,
	customSort,
	refresh,
	getBaseUrl,
	onEntityClick,
	customLenses,
	lensContext,
	...boxProps
}: AutoUIProps<T>) => {
	const { t } = useTranslation();
	const history = useHistory();

	const modelRef = React.useRef(modelRaw);
	// This allows the component to work even if
	// consumers are passing a new model object every time.
	const model = React.useMemo(() => {
		if (isEqual(modelRaw, modelRef.current)) {
			return modelRef.current;
		}
		return modelRaw;
	}, [modelRaw]);

	const [filters, setFilters] = React.useState<JSONSchema[]>([]);
	const [selected, setSelected] = React.useState<T[]>([]);
	const [isBusyMessage, setIsBusyMessage] = React.useState<
		string | undefined
	>();
	const [actionData, setActionData] = React.useState<
		ActionData<T> | undefined
	>();

	const showFilters = React.useMemo(
		() => Array.isArray(data) && !!(data?.length && data.length > 5),
		[data],
	);

	const filtered = React.useMemo(
		() => (Array.isArray(data) ? filter(filters, data) : []) as T[],
		[data, filters],
	);

	React.useEffect(() => {
		setSelected([]);
	}, [filters]);

	const changeTags = React.useCallback(
		async (tags: SubmitInfo<ResourceTagSubmitInfo, ResourceTagSubmitInfo>) => {
			if (!sdk?.tags) {
				return;
			}

			setIsBusyMessage(t(`loading.updating_release_tags`));
			notifications.addNotification({
				id: 'change-tags-loading',
				content: t(`loading.updating_release_tags`),
			});

			try {
				await sdk.tags.submit(tags);
				notifications.addNotification({
					id: 'change-tags',
					content: 'Tags updated successfully',
					type: 'success',
				});
				refresh?.();
			} catch (err) {
				notifications.addNotification({
					id: 'change-tags',
					content: err.message,
					type: 'danger',
				});
			} finally {
				notifications.removeNotification('change-tags-loading');
				setIsBusyMessage(undefined);
			}
		},
		[sdk?.tags, refresh, selected],
	);

	const onActionTriggered = React.useCallback((actionData: ActionData<T>) => {
		setActionData(actionData);
		if (actionData.action.actionFn) {
			actionData.action.actionFn({
				affectedEntries: actionData.affectedEntries || [],
			});
		}
	}, []);

	const defaultLensSlug = getFromLocalStorage(`${model.resource}__view_lens`);

	const lenses = React.useMemo(
		() => getLenses(data, lensContext, customLenses),
		[data, lensContext, customLenses],
	);

	const [lens, setLens] = React.useState<LensTemplate>(lenses[0]);

	React.useEffect(() => {
		const foundLens =
			lenses.find((lens) => lens?.slug === defaultLensSlug) || lenses[0];
		if (lens?.slug === foundLens?.slug) {
			return;
		}
		setLens(foundLens);
	}, [lenses]);

	const lensRendererOnEntityClick: typeof onEntityClick = React.useCallback(
		(row, event) => {
			onEntityClick?.(row, event);

			if (event.isPropagationStopped() && event.isDefaultPrevented()) {
				return;
			}

			if (getBaseUrl && !event.ctrlKey && !event.metaKey && history) {
				event.preventDefault();
				try {
					const url = new URL(getBaseUrl(row));
					window.open(url.toString(), '_blank');
				} catch (err) {
					history.push?.(getBaseUrl(row));
				}
			}
		},
		[onEntityClick, getBaseUrl, history],
	);

	const autouiContext = React.useMemo(
		(): AutoUIContext<T> => ({
			resource: model.resource,
			idField: 'id',
			nameField: model.priorities?.primary[0] ?? 'id',
			tagField: getFieldForFormat(model.schema, 'tag'),
			getBaseUrl,
			onEntityClick,
			actions,
			customSort,
			sdk,
		}),
		[model, getBaseUrl, onEntityClick, actions, customSort, sdk],
	);

	const properties = React.useMemo(
		() =>
			getColumnsFromSchema<T>({
				schema: model.schema,
				idField: autouiContext.idField,
				tagField: autouiContext.tagField,
				customSort: autouiContext.customSort,
				priorities: model.priorities,
				formats,
			}),
		[
			model.schema,
			autouiContext.idField,
			autouiContext.tagField,
			autouiContext.customSort,
			model.priorities,
		],
	);

	const hasUpdateActions = React.useMemo(
		() =>
			!!actions?.filter((action) => action.type !== 'create')?.length ||
			!!sdk?.tags,
		[actions, sdk?.tags],
	);

	return (
		<Flex flex={1} flexDirection="column" {...boxProps}>
			<Spinner
				flex={1}
				label={
					isBusyMessage ??
					t('loading.resource', {
						resource: t(`resource.${model.resource}_plural`).toLowerCase(),
					})
				}
				show={data == null || !!isBusyMessage}
			>
				<Flex height="100%" flexDirection="column">
					{Array.isArray(data) && (
						<>
							<Box>
								<HeaderGrid
									flexWrap="wrap"
									justifyContent="space-between"
									alignItems="baseline"
								>
									<Create
										model={model}
										autouiContext={autouiContext}
										hasOngoingAction={false}
										onActionTriggered={onActionTriggered}
									/>
									<Box
										order={[-1, -1, -1, 0]}
										flex={['1 0 100%', '1 0 100%', '1 0 100%', 'auto']}
									>
										{showFilters && (
											<Filters
												schema={model.schema}
												filters={filters}
												autouiContext={autouiContext}
												changeFilters={setFilters}
												onSearch={(term) => (
													<FocusSearch
														searchTerm={term}
														filtered={filtered}
														selected={selected}
														setSelected={setSelected}
														autouiContext={autouiContext}
														model={model}
														hasUpdateActions={hasUpdateActions}
													/>
												)}
											/>
										)}
									</Box>
									{data.length > 0 && (
										<HeaderGrid>
											{!!sdk?.tags && (
												<Tags
													autouiContext={autouiContext}
													selected={selected}
													changeTags={changeTags}
												/>
											)}
											<Update
												model={model}
												selected={selected}
												autouiContext={autouiContext}
												hasOngoingAction={false}
												onActionTriggered={onActionTriggered}
											/>
											<HeaderGrid>
												<LensSelection
													lenses={lenses}
													lens={lens}
													setLens={(lens) => {
														setLens(lens);
														setToLocalStorage(
															`${model.resource}__view_lens`,
															lens.slug,
														);
													}}
												/>
											</HeaderGrid>
										</HeaderGrid>
									)}
								</HeaderGrid>
								<Filters
									renderMode={'summary'}
									schema={model.schema}
									filters={filters}
									autouiContext={autouiContext}
									changeFilters={setFilters}
								/>
							</Box>
							{data.length === 0 && (
								<NoRecordsFoundArrow>
									{t(`no_data.no_resource_data`, {
										resource: t(`resource.item_plural`).toLowerCase(),
									})}
									<br />
									{t('questions.how_about_adding_one')}
								</NoRecordsFoundArrow>
							)}
						</>
					)}
					{!Array.isArray(data) && (
						<HeaderGrid>
							<LensSelection
								lenses={lenses}
								lens={lens}
								setLens={(lens) => {
									setLens(lens);
									setToLocalStorage(`${model.resource}__view_lens`, lens.slug);
								}}
							/>
						</HeaderGrid>
					)}

					{lens &&
						data &&
						(!Array.isArray(data) ||
							(Array.isArray(data) && data.length > 0)) && (
							<lens.data.renderer
								flex={1}
								filtered={filtered}
								selected={selected}
								properties={properties}
								hasUpdateActions={hasUpdateActions}
								changeSelected={setSelected}
								data={data}
								autouiContext={autouiContext}
								onEntityClick={lensRendererOnEntityClick}
								model={model}
							/>
						)}

					{actionData?.action?.renderer &&
						actionData.action.renderer({
							schema: actionData.schema,
							affectedEntries: actionData.affectedEntries,
							onDone: () => setActionData(undefined),
						})}
				</Flex>
			</Spinner>
		</Flex>
	);
};

export {
	autoUIRunTransformers,
	autoUIDefaultPermissions,
	autoUIGetModelForCollection,
	autoUIAddToSchema,
	AutoUIAction,
	AutoUIBaseResource,
	AutoUIRawModel,
	AutoUIModel,
	autoUIJsonSchemaPick,
	autoUIGetDisabledReason,
};

export type AutoUIEntityPropertyDefinition<T> = Required<
	Pick<
		TableColumn<T>,
		'title' | 'field' | 'key' | 'selected' | 'sortable' | 'render'
	>
> & { type: string; priority: string };

export const getColumnsFromSchema = <T extends AutoUIBaseResource<T>>({
	schema,
	idField,
	tagField,
	customSort,
	priorities,
	formats,
}: {
	schema: JSONSchema;
	idField: AutoUIContext<T>['idField'];
	tagField: AutoUIContext<T>['tagField'];
	customSort?: AutoUIContext<T>['customSort'];
	priorities?: Priorities<T>;
	formats?: Format[];
}): Array<AutoUIEntityPropertyDefinition<T>> =>
	Object.entries(schema.properties ?? {})
		// The tables treats tags differently, handle it better
		.filter((entry): entry is [keyof T, typeof entry[1]] => {
			return entry[0] !== tagField && entry[0] !== idField;
		})
		.map(([key, val]) => {
			if (typeof val !== 'object') {
				return;
			}

			const definedPriorities = priorities ?? ({} as Priorities<T>);
			const priority = definedPriorities.primary.find(
				(prioritizedKey) => prioritizedKey === key,
			)
				? 'primary'
				: definedPriorities.secondary.find(
						(prioritizedKey) => prioritizedKey === key,
				  )
				? 'secondary'
				: 'tertiary';

			const widgetSchema = { ...val, title: undefined };
			return {
				title: val.title || key,
				field: key,
				// This is used for storing columns and views
				key,
				selected: getSelected(key as keyof T, priorities),
				priority,
				type: 'predefined',
				sortable: customSort?.[key] ?? getSortingFunction(key, val),
				render: (fieldVal: string, entry: T) =>
					val.format ? (
						<CustomWidget
							extraFormats={formats ?? ([] as Format[])}
							schema={widgetSchema}
							value={fieldVal}
							extraContext={entry}
						/>
					) : (
						fieldVal
					),
			};
		})
		.filter(
			(columnDef): columnDef is NonNullable<typeof columnDef> => !!columnDef,
		);
