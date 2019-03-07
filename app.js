//wifi receive
//2019
//ang

var express=require('express')
var fs=require('fs')
var multer=require('multer')
var events=require('events')
var app = express()
var upload = multer()
var emitter = new events.EventEmitter();
var dataDir ="data"
var PORT = 8880

app.set('view engine','ejs')
app.set('views','./views/')

app.post('/upload',upload.array('up_file'),(req,res)=>{
	var l = 0;
	var pwd = req.body.pwd;
	for(var i=0;i<req.files.length;i++){
		var f = req.files[i];
		var dest = dataDir + pwd + f.originalname;
		fs.writeFile(dest,f.buffer,{flag:'wx'},(err)=>{
			if(err){ console.log(err) };
			emitter.emit('writefile',1)
		})
	};
	emitter.on('writefile',(i)=>{
		l += i;
		if(l==req.files.length){
			res.end('finish !')
		}
	})
})


app.get(/\//i,(req,res)=>{
	var reqPath = decodeURI(req.url);
	var filePath = dataDir+reqPath;
	fs.stat(filePath,(err,stats)=>{
		if (err) {	res.render('404page');return	};
		if (stats.isFile()) {
			//download file
			fs.readFile(filePath,(err,data)=>{
				if (err) {
					res.end(err.toString())
				}else{
					var z = reqPath.split('/').pop();
					var name = encodeURI(z,'utf8');
					console.log(name);
					var attachmentNote = {'Content-Disposition':'attachment;filename='+ name };	
					res.writeHead(200,attachmentNote);
					res.end(data)
				}
			})
		}else{
			//check directroy
			fs.readdir(filePath,(err,files)=>{
				if (err) {
					res.render('404page',{err})
				}else{
					var fileList = [];
					var pwd_for_visitor = (reqPath=='/')?'/':reqPath+'/';
					files.forEach(function(file){
						var this_file = fs.statSync(filePath+'/'+file);
						this_file.isDirectory()?fileList.push({name:file,type:2,time:this_file.birthtime}):fileList.push({name:file,type:1,time:this_file.birthtime})
					});
					res.render('index',{fileList,pwd:pwd_for_visitor})
				}
			})
		}
	})
})

var s= app.listen(PORT,function(){
	console.log('running on '+s.address().port)
})
