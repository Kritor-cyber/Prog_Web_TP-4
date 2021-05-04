//showTasks();
showUsers();

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
        console.log('data', data);
    });
}