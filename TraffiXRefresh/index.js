const fetch = require("node-fetch");

const appId = process.env["HereAppId"];
const appCode = process.env["HereAppCode"];

module.exports = async function (context, queueItem) {
    await fetchRoutes(context, queueItem.name, queueItem.direction);
};

async function fetchRoutes(context, teamName, direction) {
    const timestamp = 2147483647 - (Date.now() / 1000) | 0;
    const team = context.bindings.team;

    const teamLocation = "geo!" + team.location.position.latitude + "," + team.location.position.longitude;

    context.bindings.routes = [];

    for (const destination of team.destinations) {
        var waypoint0 = waypoint1 = "";

        if (direction == "inbound") {
            waypoint0 = "geo!" + destination.position.latitude + "," + destination.position.longitude;
            waypoint1 = teamLocation
        } else {
            waypoint0 = teamLocation
            waypoint1 = "geo!" + destination.position.latitude + "," + destination.position.longitude;
        }

        const url = "https://route.api.here.com/routing/7.2/calculateroute.json"
            + "?waypoint0=" + waypoint0 
            + "&waypoint1=" + waypoint1
            + "&app_id=" + appId 
            + "&app_code=" + appCode 
            + "&mode=fastest;" + "car" + ";traffic:enabled"
            + "&departure=now"
            + "&representation=overview"
            + "&alternatives=" + "1"
            + "&routeattributes=wp,sm,la,ri,ic"
            + "&jsonAttributes=1";

        let response = await fetch(url);
        let jsonResponse = await response.json();

        const routes = jsonResponse.response.route;

        for (const route of routes) {
            context.bindings.routes.push({
                ts: timestamp,
                routeId: route.routeId,
                destination: destination.name,
                baseTime: route.summary.baseTime,
                travelTime: route.summary.travelTime,
                distance: route.summary.distance,
                label: label(route),
                PartitionKey: teamName.toLowerCase().replace(" ", "") + timestamp,
                RowKey: destination.name.toLowerCase().replace(" ", "_") + "|" + route.routeId.replace(/[\/\=\+]/g, "_")
            });
        }
    }
}

function label(route) {
    if (route.label == null) {
        return "";
    } else if (route.label.length > 2) {
        return route.label[0] + " via " + route.label.slice(1).join(", ");
    } else if (route.label.length == 2) {
        return route.label[0] + " via " + route.label[1];
    } else {
        return route.label[0];
    }
}