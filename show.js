//showTasks();
showUsers();

var numberElement = 10;
var firstElement = 0;

function showUsers()
{
    document.getElementById("tableauUtilisateurs").style.display = "table";
    document.getElementById("tableauTaches").style.display = "none";
}

function showTasks()
{
    getTasks();
    document.getElementById("tableauUtilisateurs").style.display = "none";
    document.getElementById("tableauTaches").style.display = "block";
}

function getTasks()
{
    viderTableauTaches();

    let nomUtilisateurs = [];
    fetch("https://jsonplaceholder.typicode.com/users").then(response => response.json()).then(function(data) {
        data.forEach(function(item, index, array) {
            nomUtilisateurs[parseInt(item['id'])] = item['name'];
          });
    }).then(function() { // Permet d'attendre que l'association des noms aux identifiants soit terminée avant d'ajouter les valeurs au tableau
        fetch("https://jsonplaceholder.typicode.com/todos").then(response => response.json()).then(function(data) {
            data.forEach(function(item, index, array) {
                if (index >= firstElement && index < firstElement + numberElement) {
                    console.log(nomUtilisateurs[parseInt(item['userId'])] + " : " + parseInt(item['userId']));
                    createTask(nomUtilisateurs[parseInt(item['userId'])], item['id'], item['title'], item['completed']);
                }
            });
        });
     });    
}

function createTask(userName, id, title, completed)
{
    var tr = document.createElement("tr");
    let td = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];

    // Ajout des td au tr
    for (var i = 0; i < 4; i++) {
        tr.appendChild(td[i]);
        td[i].classList.add("celluleDerniereLigne"); // Ajout de l'appartenance des nouvelles celles à la classe "cellule"
    }
    // Mise des valeurs dans les td
    td[0].innerText = userName;
    td[1].innerText = id;
    td[2].innerText = title;
    td[3].innerText = completed ? "OUI" : "NON";
    
    document.getElementById("tableTasks").children[1].appendChild(tr);
}



document.getElementById('numberElement').onchange = selectNumberElement;

function selectNumberElement()
{
    numberElement = parseInt(this.value);
    verifyFirstElement();
    getTasks(); // Plus long mais permet de ne pas conserver les 200 valeurs en mémoire
}

function getPreviousTasks()
{
    firstElement -= numberElement;
    verifyFirstElement();

    getTasks();
}

function getNextTasks()
{
    firstElement += numberElement;
    verifyFirstElement();

    getTasks();
}

function verifyFirstElement()
{
    if (firstElement < 0)
        firstElement = 0;
    else if (firstElement > 199-numberElement) // Le tableau de données est limités à 200 valeurs car nous ne retenons pas le tableau en mémoire donc nous ne pouvons pas connaitre la taille du tableau (on pourrait mais ce serait beaucoup plus lourd en calcul)
        firstElement = 199-numberElement;
}

function viderTableauTaches()
{
    document.getElementById("tableTasks").children[1].innerHTML = "";
}