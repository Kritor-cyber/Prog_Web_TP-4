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
        console.log('data', data);
    });
}