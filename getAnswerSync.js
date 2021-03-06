var lessonEntities = ['课程课程名','课程教师'];
var examEntities = ['考试课程名','考试教师'];
var myio = require('./myIO.js');
var myu2 = require('./myutils2.js');
var myu = require('./myutils.js');
//sy = require("./syncLuis.js");
//var question  = "人与室内环境连之伟教室在哪";
var relationSet = ['职位','其他关系','学科','院长','校长','主任','党委职位'];
//var dataset = myio.readNewData();
// console.log('answer',answer);

module.exports = {
	getMapFormat:function(start,end){
		var res = '';
		res+='From:';
		res+=start;
		res+=';';
		res+='To:';
		res+=end;
		return res;
	},
	getPlaceAnswer:function(entities){
		if(entities.length<2) return 'LackInfoPath';
		else return this.getMapFormat(entities[0],entities[1]);
	},
	getLessonEntity:function(entities){
		qentities = new Array();
		qrelations = new Array();
		for(var i in entities){
			var entity = entities[i];
			// console.log(entity);
			var val = entity['resolution']['values'][0];
			if(entities[i].type == '课程关系') qrelations.push(val);
			else if(lessonEntities.indexOf(entity.type)!=-1){
				// console.log(entity.type)
				qentities.push(val);
			} 
		}
		return [qentities,qrelations];
	},
	getExamEntity:function(entities){
		qentities = new Array();
		qrelations = new Array();
		for(var i in entities){
			var entity = entities[i];
			// console.log(entity);
			var val = entity['resolution']['values'][0];
			var si = entity.startIndex;var ei = entity.endIndex;
			if(entities[i].type == '考试关系') qrelations.push(val);
			else if(examEntities.indexOf(entity.type)!=-1){
				// console.log(entity.type)
				qentities.push([val,si,ei]);
			} 
		}
		qentities = myu.removeSmallEntity(qentities,qentities);
		qentities = myu.disIndex(qentities);
		return [qentities,qrelations];
	},
	getMapFromQuestion:function(entities){
		placeentities = new Array();
		for(var i in entities){
			var entity = entities[i];
			var val = entity['resolution']['values'][0];
			// placeentities.push(val);
			if(entities[i].type == '寻路地址') placeentities.push(val);
		}
		return placeentities;
	},
	getLessonAnswer:function(entities){
		var qentities = this.getLessonEntity(entities)[0];
		var qrelations = this.getLessonEntity(entities)[1][0];
		console.log(qentities);console.log(qrelations);
		var answer = myu2.getAnswerLesson(qentities,qrelations);
		return answer;
	},
	getExamAnswer:function(entities){
		var qentities = this.getExamEntity(entities)[0];
		var qrelations = this.getExamEntity(entities)[1][0];
		console.log(qentities);console.log(qrelations);
		var answer = myu2.getAnswerExam(qentities,qrelations);
		return answer;
	},
	getPathAnswer:function(entities){
		// var res = sy.getIntentLuis(question);
		// var entities = res[0].entities;
		var placeentities = this.getMapFromQuestion(entities);
		console.log(placeentities);
		var ans = this.getPlaceAnswer(placeentities);
		return ans;
	},
	getIntentAndEntities:function(question){
		var res = sy.getIntentLuis(question);
		var entities = res[0].entities;
		var intent = res[0].topScoringIntent==undefined  ? '' : res[0].topScoringIntent.intent;
		return [intent,entities];
	},
	getQuestionTriples:function(entities){
		var qrelations = new Array();
		var qentities = new Array();
		var qdescriptions = new Array();
		for(var i in entities){
			var entity = entities[i];
			var val = entity['resolution']['values']==undefined ? entity['resolution']['value'] : entity['resolution']['values'][0];
			var si = entity.startIndex;
			var ei = entity.endIndex;
			if(relationSet.indexOf(entity['type'])!=-1){
				qrelations.push([val,si,ei]);
			}else if(entity['type']=='定语' || entity['type']=='builtin.number'){
				qdescriptions.push([val,si,ei]);
			}else{
				qentities.push([val,si,ei]);
			}
		}
		qentities = myu.unique(qentities); 
		qrelations = myu.unique(qrelations);
		qdescriptions = myu.unique(qdescriptions);
		return [qentities,qrelations,qdescriptions];
	},
	getInfoAnswer:function(intentType,entities,originalQues,lastentity,lastrelation){
		var questionTriple = this.getQuestionTriples(entities);
		var qentities = questionTriple[0];
		var qrelations = questionTriple[1];
		var qdescriptions = questionTriple[2];
		var answer = myu.process(lastentity,lastrelation,qrelations,qentities,qdescriptions,intentType,dataset,originalQues);
		return answer;
	},
	getCalendarData:function (time,userName){
		var dataset = myio.readCanlendarData();
		var res = "";
		if(time == ""){
			for(var i in dataset){
				if(dataset[i][0]==userName){
					res+=dataset[i][2];
					res+=" ";
					res+=dataset[i][3];
					res+=" ";
				}
			}
		}else{
			for(var i in dataset){
				if(dataset[i][0]==userName && dataset[i][2]==time){
					res+=dataset[i][2];
					res+=" ";
					res+=dataset[i][3];
					res+=" ";
				}
			}
		}
		res = res=="" ? 'schedual not found' : res;
		return res;
	},
	addCalendarData:function(time,userName,content){
		// var time = times.length == 0 ? "" : times[0];
		var data = userName+"\t"+"pwd"+"\t"+time+"\t"+content+"\r\n";
		myio.addCalendarData(data);
	}
}
