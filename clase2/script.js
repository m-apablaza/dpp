const students=[
"Catalina Garín",
"Camila Sandoval",
"Yamil Tala",
"Trinidad Valdés",
"Isabel Véliz"
];

let currentStudent="";

const data=JSON.parse(localStorage.getItem("researchApp"))||{
questions:{},
ratings:[]
};

function saveData(){
localStorage.setItem("researchApp",JSON.stringify(data));
}

function showPage(n){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById("page"+n).classList.add("active");
if(n===3)loadRatingsPage();
if(n===4)showResults();
}

function nextToQuestions(){
const name=document.getElementById("studentSelect").value;
if(!name){alert("Select your name.");return;}
currentStudent=name;
showPage(2);
}

function saveQuestions(){
const q1=q1El.value.trim();
const q2=q2El.value.trim();
const q3=q3El.value.trim();

if(!q1||!q2||!q3){
alert("Complete all questions.");
return;
}

data.questions[currentStudent]=[q1,q2,q3];
saveData();
showPage(3);
}

const q1El=document.getElementById("q1");
const q2El=document.getElementById("q2");
const q3El=document.getElementById("q3");

function loadRatingsPage(){

const c=document.getElementById("ratingContainer");
c.innerHTML="";

students.filter(s=>s!==currentStudent).forEach(student=>{

const qs=data.questions[student]||["Not submitted","Not submitted","Not submitted"];

const block=document.createElement("div");
block.className="studentBlock";
block.innerHTML=`<h3>${student}</h3>`;

qs.forEach((q,i)=>{

const div=document.createElement("div");
div.className="question";

let radios="";
for(let r=1;r<=7;r++){
radios+=`
<label>
<input type="radio"
name="${student}-${i}"
value="${r}">
${r}
</label>`;
}

div.innerHTML=`<p>${q}</p><div class="rating">${radios}</div>`;
block.appendChild(div);

});

c.appendChild(block);

});
}

function saveRatings(){

const ratings=[];

for(const student of students.filter(s=>s!==currentStudent)){

for(let i=0;i<3;i++){

const checked=document.querySelector(`input[name="${student}-${i}"]:checked`);

if(!checked){
alert("Rate every question.");
return;
}

ratings.push({
rater:currentStudent,
student,
question:i,
score:Number(checked.value)
});

}
}

data.ratings=data.ratings.filter(r=>r.rater!==currentStudent);
data.ratings.push(...ratings);

saveData();
showPage(4);
}

function showResults(){

const div=document.getElementById("results");

let html="<table border='1' cellpadding='8'><tr><th>Student</th><th>Question</th><th>Total</th></tr>";

students.forEach(student=>{

const qs=data.questions[student]||["-","-","-"];

let totalStudent=0;

qs.forEach((q,i)=>{

const total=data.ratings
.filter(r=>r.student===student&&r.question===i)
.reduce((a,b)=>a+b.score,0);

totalStudent+=total;

html+=`<tr>
<td>${student}</td>
<td>${q}</td>
<td>${total}</td>
</tr>`;

});

html+=`<tr style="font-weight:bold;background:#eee">
<td>${student}</td>
<td>Student Total</td>
<td>${totalStudent}</td>
</tr>`;

});

html+="</table>";

div.innerHTML=html;
}
