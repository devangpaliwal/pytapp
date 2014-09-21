"use strict";

var _ = require('underscore'),
	request = require('superagent'),
	async = require('async');
	


function Tripparser(baseurl){
	if(!(this instanceof Tripparser)) return new Tripparser(baseurl);
	this.baseurl = baseurl;
	this.urlArray = getUrlArray(baseurl);
}

function getUrlArray(url){
	var id = _(_(url.split("/").reverse()).first(2)).last();
	var urlArr = new Array(8);
	return _.map(urlArr,function(elem,key){
		var key = key+1;
		return "https://spreadsheets.google.com/feeds/list/"+id+"/"+key+"/public/values?alt=json";
	});
}


function fetchMe(cb){
	var asyncTasks = [];
	this.urlArray.forEach(function(url){
		asyncTasks.push(function(callback){ getJsonForUrl(url,callback); });
	}); 


	async.parallel(asyncTasks, function(err,result){
  		cb(result);
	});

	// call all urls async and consolidate in an array and return data
}

function getJsonForUrl(url,callback){
	request.get(url).end(function(res){
    	callback(null,transform(res.body));
	});
}	

function transform(res){
	var obj = {};
	//debugger;
	obj.type = res.feed.title['$t'];
	obj.entities = [];

	_.each(res.feed.entry,function(ent){
		var actEnt = {};
		_.each(ent,function(value,key){
			if(key.indexOf("gsx$") > -1){
				actEnt[key.substring(4)] = value['$t'] ? value['$t'] : null;
			}
		});
		obj.entities.push(actEnt);
	});
	return obj;
}

_.extend(Tripparser.prototype,{
	"fetch" : function(callback){
		fetchMe.call(this,callback);
	}
});

module.exports = Tripparser;