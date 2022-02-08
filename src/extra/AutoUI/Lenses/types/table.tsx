import React from 'react';
import { faTable } from '@fortawesome/free-solid-svg-icons/faTable';
import { Table } from '../../../../components/Table';
import { LensTemplate } from '..';
import { CollectionLensRendererProps } from '.';

export const table: LensTemplate = {
	slug: 'table',
	name: 'Default table lens',
	data: {
		label: 'Table',
		format: 'table',
		renderer: ({
			filtered,
			selected,
			properties,
			hasUpdateActions,
			changeSelected,
			data,
			autouiContext,
			onEntityClick,
			onPageChange,
			onSort,
			pagination,
		}: CollectionLensRendererProps<any>) => (
			<Table<any>
				rowKey="id"
				data={filtered}
				checkedItems={selected}
				columns={properties}
				{...(hasUpdateActions && { onCheck: changeSelected })}
				usePager={data && data.length > 5}
				pagerPosition="bottom"
				getRowHref={autouiContext.getBaseUrl}
				onRowClick={onEntityClick}
				onPageChange={onPageChange}
				onSort={onSort}
				pagination={pagination}
				columnStateRestorationKey={`${autouiContext.resource}__columns`}
				sortingStateRestorationKey={`${autouiContext.resource}__sort`}
				tagField={autouiContext.tagField}
				enableCustomColumns
			/>
		),
		icon: faTable,
		type: '*',
		filter: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'number',
					},
				},
			},
		},
	},
};
