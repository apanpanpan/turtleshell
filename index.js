var express = require('express')
var app = express()
var fs = require('fs')
const path = require('path');
var bodyParser = require('body-parser')
var _ = require("underscore")
var exphbs = require('express-handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
const publicPath = path.join(__dirname, '../BITCAMP');

var allData = JSON.parse(fs.readFileSync('rooms.json')).rooms

app.get('/sublease', function (req, res){
  var result = allData;
	if(req.query.building){
    var resultnew = []
		for(var r of result){
			if(req.query.building.search(r.building) != -1){
				resultnew.push(r)
			}
		}
    result = resultnew;
	}

	if(req.query.group){
		var group = parseInt(req.query.group)
		var resultnew = []

		for(var r of result){
			if(r.vacancy >= group){
				resultnew.push(r)
			}
		}

		result = resultnew
	}

	if(req.query.gender){
		result = _.where(result, {gender: req.query.gender})
	}

	if(req.query.semester){
		var resultnew = []
		var count = 0

		for(var r of result){
			for(var i=0; i<req.query.semester.length; i++){
				if(r.semesters.search(req.query.semester.charAt(i)) != -1){
					count++
				}
			}
			if(count >= req.query.semester.length){
				resultnew.push(r)
			}
		}

		result = resultnew
	}

  var curr = result[0];
  var vals = {
      l: req.query.building != undefined && req.query.building.search('l') != -1,
      c: req.query.building != undefined && req.query.building.search('c') != -1,
      t: req.query.building != undefined && req.query.building.search('t') != -1,
      y: req.query.building != undefined && req.query.building.search('y') != -1,
      w: req.query.building != undefined && req.query.building.search('w') != -1,
      o: req.query.building != undefined && req.query.building.search('o') != -1,
      m: req.query.gender != undefined && req.query.gender.search('m') != -1,
      fem:req.query.gender != undefined &&  req.query.gender.search('f') != -1,
      f: req.query.semester != undefined && req.query.semester.search('f') != -1,
      s: req.query.semester != undefined && req.query.semester.search('s') != -1,
      p: req.query.semester != undefined && req.query.semester.search('p') != -1,
      wint:req.query.semester != undefined && req.query.semester.search('w') != -1,
      one: req.query.group != undefined && req.query.group.search('1') != -1,
      two: req.query.group != undefined && req.query.group.search('2') != -1,
      three: req.query.group != undefined && req.query.group.search('3') != -1,
      four: req.query.group != undefined && req.query.group.search('4') != -1
  }
  if (curr) {
    info = "<div class=\"Roominfo\">"
    for (var i of curr.roomInfo) {
      info += "<p>" + i + "</p>"
    }
    info += "</div>"

    var url = req.protocol + '://' + req.get('host') + req.originalUrl
    var builds = {building: curr.buildingFull, roomBio: curr.roomBio, roomInfo: info, url:
    curr.pic, roomUrl: curr.roomPic, bio: curr.bio}

    res.render('home', {builds: builds, vals: vals, none: false});
  } else {
    res.render('home', {builds: builds, vals: vals, none: true});
  }

})

app.get('/submit', function (req, res){
  res.render('submit');
})

app.post('/submit', function(req, res) {
  var body = req.body;
  var bNames = ["Landmark", "South Campus Commons 1", "South Campus Commons 2", "South Campus Commons 3", "South Campus Commons 4", "South Campus Commons 5", "South Campus Commons 6", "South Campus Commons 7", "Terrapin Row", "Varsity", "View", "Off Campus Housing"]
  var b = ["l", "c","c","c","c","c","c","c","t","y","w","o"]

  /* room info */
  var info = ["Room "+body.number, "$"+parseInt(body.rent)+" / month"]
  if (body.kitchen) {
    info.push("Kitchen")
  }
  if (body.washing) {
    info.push("Washing Machine")
  }
  if (body.living) {
    info.push("Living Room")
  }

  /* semesters */
  var s = ""
  if (body.f) {
    s += "f"
    info.push("Fall")
  }
  if (body.w) {
    s += "w"
    info.push("Winter")
  }
  if (body.p) {
    s += "p"
    info.push("Spring")
  }
  if (body.s) {
    s += "s"
    info.push("Summer")
  }

  var newRoom = {
    building: b[body.building - 1],
    buildingFull: bNames[body.building - 1],
    vacancy: body.vacancy,
    gender: body.gender,
    semesters: s,
    roomInfo: info,
    pic: body.pic,
    roomPic: body.roomPic,
    bio: body.bio,
    roomBio: body.roomBio
  }

  allData.push(newRoom);
  fs.writeFileSync('rooms.json', JSON.stringify({rooms:allData}));

  res.redirect("/sublease");
})

app.get('/roommate', function (req, res){
	//if(req.query.gender){

	//}
})

app.get('/messages', function (req, res){

})

app.get('/profile', function (req, res){

})

app.listen(3000, function(){
	console.log('Listening on port 3000!')
})
