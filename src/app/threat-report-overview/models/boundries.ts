export class Boundries {
    public malware = new Set<string>();
    public intrusions = new Set<string>();
    public targets = new Set<string>();
    public startDate?: any;
    public endDate?: any;

    public emptyBoundries(): boolean {
        if (this.malware.size === 0 && this.intrusions.size === 0 && this.targets.size === 0
            && this.startDate === undefined && this.endDate === undefined) {
            return true;
        } else {
            return false;
        }
    }
}
