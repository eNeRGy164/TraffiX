module.exports = async function (context, req, routes) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name) {
        var recentRoutes = [];
        var timestamp = Number.MAX_SAFE_INTEGER;
        var group = groupBy(routes, "ts");

        for (const key in group) {
            if (group.hasOwnProperty(key)) {
                const element = group[key];

                if (element[0].ts < timestamp) {
                    timestamp = element[0].ts;
                    recentRoutes = element;
                }
            }
        }

        recentRoutes.forEach(element => {
            delete element['ts'];
            delete element['PartitionKey'];
            delete element['RowKey'];
        });

        context.res = {
            body: JSON.stringify(recentRoutes)
        };
        
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a team name on the query string"
        };
    }
};

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};  