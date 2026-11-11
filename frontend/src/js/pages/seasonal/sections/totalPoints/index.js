import { createLineChart } from "../../../../shared/charts/lineChart";
import { toTotalPointsSeries } from "./selectors";

export function mount(container, progression) {
    const { labels, series } = toTotalPointsSeries(progression);
    return createLineChart(container.querySelector('canvas'), {
        labels, series, xTitle: 'Gameweek', yTitle: 'Total Points'
    });
}