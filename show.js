//showTasks();
showUsers();
getTasks();

function showUsers()
{
    document.getElementById("tableauUtilisateurs").style.display = "table";
    document.getElementById("tableauTaches").style.display = "none";
}

function showTasks()
{
    document.getElementById("tableauUtilisateurs").style.display = "none";
    document.getElementById("tableauTaches").style.display = "block";
}

function getTasks()
{
    fetch("https://jsonplaceholder.typicode.com/todos").then(response => response.json()).then(function(data) {
        // Affiche les 200 données récupérées à l'adresse : https://jsonplaceholder.typicode.com/todos, chaque données étant caractéristées par un 'userID', un 'id', un titre : 'title' et un booleén indiquant si la tache a été complétée
        //console.log('data', data);
        data.forEach(function(item, index, array) {
            createTask(item['userId'], item['id'], item['title'], item['completed']);
          });
    });
}

function createTask(userId, id, title, completed)
{
    var tr = document.createElement("tr");
    let td = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];

    // Ajout des td au tr
    for (var i = 0; i < 4; i++) {
        tr.appendChild(td[i]);
        td[i].classList.add("celluleDerniereLigne"); // Ajout de l'appartenance des nouvelles celles à la classe "cellule"
    }
    // Mise des valeurs dans les td
    td[0].innerText = userId;
    td[1].innerText = id;
    td[2].innerText = title;
    td[3].innerText = completed ? "OUI" : "NON";
    
    document.getElementById("tableTasks").children[1].appendChild(tr);
}