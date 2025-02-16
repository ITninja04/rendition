import * as React from 'react';
import { createPoll, Poll } from '../utils/poll';

export interface UseRequestOptions {
	polling: boolean;
	pollInterval?: number;
	stopExecution?: boolean;
}

type RequestError = Error | null | undefined;
type ForcePoll = () => void;

type ResolvableReturnType<T extends (...args: any[]) => any> = T extends (
	...args: any[]
) => Promise<infer R>
	? R
	: any;

export const useRequest = <
	TFn extends () => Promise<any>,
	TResult extends ResolvableReturnType<TFn>,
>(
	action: TFn,
	deps: React.DependencyList,
	options: UseRequestOptions,
) => {
	const { polling, pollInterval, stopExecution } = options;
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<RequestError>();
	const [data, setData] = React.useState<TResult>();
	const [isVisible, setIsVisible] = React.useState(true);
	const pollRef = React.useRef<Poll>();

	React.useEffect(() => {
		const handleVisibilityChange = () => setIsVisible(!document.hidden);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () =>
			document.removeEventListener('visibilitychange', handleVisibilityChange);
	});

	const loadData = React.useCallback(async () => {
		try {
			const response = await action();
			setData(response);
		} catch (e) {
			if (e instanceof Error) {
				setError(e);
			} else {
				setError(new Error(typeof e === 'string' ? e : 'Unknown error'));
			}
			setData([] as TResult);
		} finally {
			setLoading(false);
		}
	}, deps);

	const forcePoll = React.useCallback<ForcePoll>(() => {
		setLoading(true);
		if (pollRef.current) {
			pollRef.current.poll({ forced: true });
		} else {
			loadData();
		}
	}, [pollRef, loadData]);

	React.useEffect(() => {
		if (stopExecution) {
			return pollRef.current && pollRef.current.stop();
		}

		if (!polling) {
			loadData();
			return;
		}

		pollRef.current = createPoll(loadData, pollInterval, isVisible);
		pollRef.current.start();

		return () => {
			if (pollRef.current) {
				pollRef.current.destroy();
				pollRef.current = undefined;
			}
		};
	}, [polling, loadData, pollInterval, stopExecution, isVisible]);

	return [data, loading, error, forcePoll] as
		| [TResult | undefined, true, RequestError, ForcePoll]
		| [TResult, false, RequestError, ForcePoll];
};
