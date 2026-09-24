const catalogue = [
  {category:'Plumbing',keys:['sink','tap','pipe','leak','drain','toilet'],skills:['Leak Detection','Pipe Repair'],priority:'MEDIUM'},
  {category:'Electrical',keys:['electric','wiring','switch','socket','power','light'],skills:['Electrical Repair','Safety Inspection'],priority:'HIGH'},
  {category:'AC Repair',keys:['ac ','air conditioner','cooling','refriger','indoor unit'],skills:['AC Servicing','Leak Detection'],priority:'MEDIUM'},
  {category:'Appliance Repair',keys:['washing machine','washer','fridge','microwave','appliance'],skills:['Appliance Diagnostics','Washing Machine Repair'],priority:'MEDIUM'},
  {category:'Cleaning',keys:['clean','stain','dust','deep clean'],skills:['Home Cleaning'],priority:'LOW'},
  {category:'Carpentry',keys:['door','furniture','wood','cabinet'],skills:['Furniture Repair'],priority:'MEDIUM'},
  {category:'Painting',keys:['paint','wall','peeling'],skills:['Interior Painting'],priority:'LOW'}
];
export async function analyzeProblem(description,manualCategory) {
  const text = String(description||'').toLowerCase();
  const found = catalogue.map(c=>({...c,score:c.keys.reduce((n,k)=>n+(text.includes(k)?1:0),0)})).sort((a,b)=>b.score-a.score)[0];
  const classification = found.score ? found : catalogue[7];
  const category = manualCategory || classification.category;
  const chosen = catalogue.find(c=>c.category===category)||classification;
  if(process.env.AI_API_KEY){try{const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.AI_API_KEY}`},body:JSON.stringify({model:'gpt-4o-mini',response_format:{type:'json_object'},messages:[{role:'system',content:`Classify home service requests. Return JSON keys category, requiredSkills (string array), priority (LOW, MEDIUM, HIGH), shortSummary, followUpQuestions (string array). Allowed categories: ${catalogue.map(c=>c.category).join(', ')}. Suggestions are not a diagnosis.`},{role:'user',content:`Problem: ${String(description).slice(0,2000)}\nCustomer selected category: ${manualCategory||'none'}`}],temperature:0.2})});if(response.ok){const payload=await response.json(),result=JSON.parse(payload.choices?.[0]?.message?.content||'{}'),valid=catalogue.some(c=>c.category===result.category);if(valid&&Array.isArray(result.requiredSkills)&&['LOW','MEDIUM','HIGH'].includes(result.priority)&&typeof result.shortSummary==='string')return{category:manualCategory||result.category,requiredSkills:result.requiredSkills.slice(0,8),priority:result.priority,shortSummary:result.shortSummary.slice(0,240),followUpQuestions:Array.isArray(result.followUpQuestions)?result.followUpQuestions.slice(0,3):[],source:'AI assisted',assisted:true};}}catch{/* Use the local classification if AI is unavailable or returns invalid data. */}}
  return {category,requiredSkills:chosen.skills,priority:classification.priority,shortSummary:`Your description appears to require ${category.toLowerCase()} assistance. This is a suggestion, not a technical diagnosis.`,followUpQuestions: text.includes('not working')?['When did the issue begin?','Is the appliance receiving power?']:[],source:'rule-based fallback',assisted:true};
}
