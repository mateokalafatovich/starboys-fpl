import { getStandingsProgression } from "../../api/league";
import * as totalPoints from "./sections/totalPoints/index";

async function init() {
    const section = document.getElementById('total-points');
    try {
        const progression = await getStandingsProgression();
        totalPoints.mount(section, progression);
    } catch (error) {
        console.error(error);
    }
}

init();