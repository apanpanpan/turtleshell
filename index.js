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
  if (curr) {
    info = "<div class=\"Roominfo\">"
    for (var i of curr.roomInfo) {
      info += "<p>" + i + "</p>"
    }
    info += "</div>"

    var url = req.protocol + '://' + req.get('host') + req.originalUrl
    var vals = {
        l: req.query.building != undefined && req.query.building.search('l') != -1,
        c: if (req.query.building) {req.query.building.search('c') != -1} else {false},
        t: if (req.query.building) {req.query.building.search('t') != -1} else {false},
        y: if (req.query.building) {req.query.building.search('y') != -1} else {false},
        w: if (req.query.building) {req.query.building.search('w') != -1} else {false},
        o: if (req.query.building) {req.query.building.search('o') != -1} else {false},
        m: if (req.query.gender) {req.query.gender.search('m') != -1} else {false},
        fem:if (req.query.gender) { req.query.gender.search('f') != -1} else {false},
        f: if (req.query.semester) {req.query.semester.search('f') != -1} else {false},
        s: if (req.query.semester) {req.query.semester.search('s') != -1} else {false},
        p: if (req.query.semester) {req.query.semester.search('p') != -1} else {false},
        wint: if (req.query.semester) {req.query.semester.search('w') != -1} else {false},
        one: if (req.query.group) {req.query.group.search('1') != -1} else {false},
        two: if (req.query.group) {req.query.group.search('1') != -1} else {false},
        three: if (req.query.group) {req.query.group.search('1') != -1} else {false},
        four: if (req.query.group) {req.query.group.search('1') != -1} else {false}
    }
    var builds = {building: curr.buildingFull, roomBio: curr.roomBio, roomInfo: info, url:
    curr.pic, roomUrl: curr.roomPic, bio: curr.bio}

    res.render('home', {builds: builds, vals: vals});
  } else {
    res.render('error');
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
