var uwsgi_stats = []
var uwsgi_stats_url;
var uwsgi_stats_freq;

function uwsgi_stats_setup(url, freq=3000) {
	uwsgi_stats_url = url;
	uwsgi_stats_freq = freq;
}

function uwsgi_stats_initialize(max) {
	var res = [];
        for(i=0;i<max;i++) {
        	res.push([i, 0]);
        }
        return res;
}

function uwsgi_stats_add(container_id, hook, y_max=300, color='#B1D535', config=undefined) {
	var container = $("#" + container_id);
	var max = container.outerWidth() / 2 || 300;
	var us = {}

	us.data = [];
	for(i=0;i<max;i++) {
		us.data[i] = 0;
	}

	us.hook = hook;

	us.series = [{
                data: uwsgi_stats_initialize(max),
                lines: {
                        fill: true
                },
		color: color,
        }];

	if (config == undefined) {
		config = { yaxis: {min:0, max:y_max}};
	}
	
	us.plot = $.plot(container, us.series, config);
	uwsgi_stats.push(us);
}

function uwsgi_stats_update_single(us, json) {
	if (us.data.length) {
		us.data = us.data.slice(1);
	}

	var y = us.hook(us.data, json);
	us.data.push(y);

	var res = [];
        for (var i = 0; i < us.data.length; i++) {
        	res.push([i, us.data[i]])
        }

        us.series[0].data = res;
        us.plot.setData(us.series);
        us.plot.draw();
}

function uwsgi_stats_update(json) {
	for(var i=0;i<uwsgi_stats.length;i++) {
		var us = uwsgi_stats[i];
		uwsgi_stats_update_single(us, json);	
	}
}

function uwsgi_stats_get_json() {
	$.getJSON(uwsgi_stats_url, uwsgi_stats_update);
}


function uwsgi_stats_run() {
	setInterval(uwsgi_stats_get_json, uwsgi_stats_freq);
}
