export interface Collection {
	name: string;
	maxInvocations: number;
	projectId: number;
	invocations?: number;
	paused?: boolean;
	locked?: boolean;
}
