import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Alert } from '../../components/Alert';
import { Button, ButtonProps } from '../../components/Button';
import { DropDownButton } from '../../components/DropDownButton';
import { Flex } from '../../components/Flex';
import { Txt } from '../../components/Txt';

import { DownloadFormModel, FormModel } from './FormModel';
import { DeviceType } from './models';
import { DownloadOptions } from './DownloadImageModal';

export enum DownloadTypeEnum {
	config,
	image,
}

const debounceDownloadSize = debounce(
	(getDownloadSize, deviceType, rawVersion, setDownloadSize) =>
		getDownloadSize(deviceType.slug, rawVersion)
			.then(setDownloadSize)
			.catch(() => {
				setDownloadSize(null);
			}),
	200,
	{
		trailing: true,
		leading: false,
	},
);

const getDeviceTypeOptions = (deviceType: DeviceType) => {
	if (!deviceType.options) {
		return [];
	}

	return cloneDeep(deviceType.options).map((group) => {
		// Add an extra label value for network config
		if (group.name === 'network') {
			group.options.forEach((g) => {
				if (g.name === 'network') {
					g.choicesLabels = {
						ethernet: 'Ethernet only',
						wifi: 'Wifi + Ethernet',
					};
				}
			});
		}

		return group;
	});
};

const isDownloadDisabled = (
	formModel: FormModel,
	rawVersion: ImageFormProps['rawVersion'],
) => {
	if (!rawVersion) {
		return true;
	}

	return formModel.network === 'wifi' && !formModel.wifiSsid;
};

interface ImageFormProps {
	downloadUrl: string;
	appId: number;
	releaseId?: number;
	rawVersion: string | null;
	deviceType: DeviceType;
	authToken?: string;
	onDownloadStart?: (
		downloadConfigOnly: boolean,
		downloadOptions: DownloadOptions,
	) => void;
	setIsDownloadingType: (isDownloading: DownloadTypeEnum | null) => void;
	downloadConfig?: (model: FormModel) => Promise<void> | undefined;
	getDownloadSize?: () => Promise<string> | undefined;
	modalActions?: Array<
		Omit<ButtonProps, 'onClick'> & {
			onClick: (event: React.MouseEvent, model: DownloadOptions) => void;
		}
	>;
	configurationComponent: React.ReactNode;
}

export const ImageForm = ({
	downloadUrl,
	appId,
	releaseId,
	rawVersion,
	deviceType,
	authToken,
	onDownloadStart,
	setIsDownloadingType,
	downloadConfig,
	getDownloadSize,
	modalActions,
	configurationComponent,
}: ImageFormProps) => {
	const [downloadSize, setDownloadSize] = React.useState<string | null>(null);
	// If the image is deployed to docker, we only offer config
	// download, so there is no need to show the toggle
	const hasDockerImageDownload =
		deviceType?.yocto?.deployArtifact === 'docker-image';
	const [model, setModel] = React.useState<FormModel>({
		downloadConfigOnly: hasDockerImageDownload,
	});

	const downloadOptions = React.useMemo(
		() => ({
			appId,
			releaseId,
			deviceType: deviceType.slug,
			appUpdatePollInterval: model.appUpdatePollInterval,
			network: model.network,
			version: rawVersion,
		}),
		[appId, releaseId, deviceType, model, rawVersion],
	) as DownloadOptions;

	const setDownloadConfigOnly = (downloadConfigOnly: boolean) => {
		if (typeof onDownloadStart === 'function') {
			onDownloadStart(downloadConfigOnly, {
				...downloadOptions,
				downloadConfigOnly,
			});
		}
		setModel({
			...model,
			downloadConfigOnly,
		});
	};

	React.useEffect(() => {
		if (hasDockerImageDownload && !model.downloadConfigOnly) {
			setDownloadConfigOnly(true);
		}
	}, [hasDockerImageDownload, model.downloadConfigOnly]);

	React.useEffect(() => {
		if (!deviceType || !rawVersion || !getDownloadSize) {
			setDownloadSize(null);
			return;
		}

		// Debounce as the version changes right after the devicetype does, resulting in multiple requests.
		debounceDownloadSize(
			getDownloadSize,
			deviceType,
			rawVersion,
			setDownloadSize,
		);
	}, [deviceType?.slug, rawVersion]);

	const download = async (url: string) => {
		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: new Headers({
					Authorization: 'Bearer ' + authToken,
				}),
			});
			const blob = await res.blob();
			const newBlob = new Blob([blob]);

			const blobUrl = window.URL.createObjectURL(newBlob);

			const link = document.createElement('a');
			link.href = blobUrl;
			link.setAttribute(
				'download',
				`${window.location.host}-${deviceType.slug}-${rawVersion}.img.zip`,
			);
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);

			window.URL.revokeObjectURL(blob as any);
		} catch (error) {
			console.error(error);
		}
	};

	const { t } = useTranslation();

	return (
		<form
			autoComplete="off"
			style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
		>
			{configurationComponent}

			<Flex flexDirection="column" flex="1">
				<DownloadFormModel
					model={model}
					onModelChange={setModel}
					options={getDeviceTypeOptions(deviceType)}
				/>
			</Flex>

			{(deviceType.imageDownloadAlerts ?? []).map((alert) => {
				return (
					<Alert
						key={alert.message}
						mb={3}
						info={alert.type === 'info'}
						warning={alert.type === 'warning'}
						danger={alert.type === 'danger'}
						success={alert.type === 'success'}
					>
						{alert.message}
					</Alert>
				);
			})}

			<Flex>
				{!!modalActions?.length &&
					modalActions.map(({ onClick, ...otherProps }) => (
						<Button
							mt={2}
							onClick={(event) => onClick(event, downloadOptions)}
							{...otherProps}
						/>
					))}
				{!downloadConfig && (
					<Button
						mt={2}
						ml="auto"
						className="e2e-download-image-submit"
						primary
						type="submit"
						disabled={hasDockerImageDownload}
						tooltip={
							hasDockerImageDownload
								? t('warnings.image_deployed_to_docker')
								: ''
						}
						onClick={() => setDownloadConfigOnly(false)}
					>
						<Txt bold={!model.downloadConfigOnly}>
							{t('actions.download_balenaos') +
								(rawVersion && downloadSize ? ` (~${downloadSize})` : '')}
						</Txt>
					</Button>
				)}
				{!!downloadConfig && (
					<DropDownButton
						mt={2}
						primary
						ml="auto"
						className="e2e-download-image-submit"
						type={!model.downloadConfigOnly ? 'submit' : 'button'}
						disabled={isDownloadDisabled(model, rawVersion)}
						tooltip={
							isDownloadDisabled(model, rawVersion)
								? t('warnings.fill_wifi_credentials')
								: ''
						}
						onClick={async (event) => {
							event.preventDefault();
							event.stopPropagation();
							if (model.downloadConfigOnly && downloadConfig) {
								setIsDownloadingType(DownloadTypeEnum.config);
								await downloadConfig(model);
							} else {
								setIsDownloadingType(DownloadTypeEnum.image);
								await download(
									downloadUrl +
										`?appId=${appId}&deviceType=${deviceType?.slug}`,
								);
							}
							setIsDownloadingType(null);
						}}
						icon={<FontAwesomeIcon icon={faDownload} />}
						label={
							model.downloadConfigOnly
								? t('actions.download_configuration_file')
								: t('actions.download_balenaos') +
								  (rawVersion && downloadSize ? ` (~${downloadSize})` : '')
						}
						alignRight
						dropUp
					>
						<Button
							plain
							disabled={hasDockerImageDownload}
							tooltip={
								hasDockerImageDownload
									? t('warnings.image_deployed_to_docker')
									: ''
							}
							onClick={() => setDownloadConfigOnly(false)}
						>
							<Txt bold={!model.downloadConfigOnly}>
								{t('actions.download_balenaos')}
							</Txt>
						</Button>
						<Button plain onClick={() => setDownloadConfigOnly(true)}>
							<Txt bold={!!model.downloadConfigOnly}>
								{t('actions.download_configuration_file_only')}
							</Txt>
						</Button>
					</DropDownButton>
				)}
			</Flex>
		</form>
	);
};
