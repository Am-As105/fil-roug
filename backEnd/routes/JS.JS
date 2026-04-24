


const students = [
  { name: "Ali", score: 78 },
  { name: "Sara", score: 92 },
  { name: "Yassine", score: 45 },
  { name: "Imane", score: 66 },
  { name: "Karim", score: 50 }
];


const newStudents = {name: 'amine', score:80};
students.push(newStudents);

 function find(amine)
 {
    let i = 0;
    while (i < students.length)
    {
        if (students[i].name == amine){
            return "name found";
            
        }
        i++;
    }

 }
 
  