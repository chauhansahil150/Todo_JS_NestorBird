const BACKEND_URL='http://127.0.0.1:8000'
let arr=[]

const noOfProducts = document.getElementById('no_of_products');

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// function drop(ev, targetId) {
//     ev.preventDefault();
//     var data = ev.dataTransfer.getData("text");
//     var draggedElement = document.getElementById(data);
//     var targetContainer = document.getElementById(targetId);
//     targetContainer.appendChild(draggedElement);
// }

function drop(ev, targetId) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    var targetContainer = document.getElementById(targetId);
    targetContainer.appendChild(draggedElement);

    // Extract task ID from the dragged element's ID
    var taskId = data.split("_")[1];

    // Determine the new status based on the target container's ID
    var newStatus;
    var backgroundColor;
    switch(targetId) {
        case 'task_pending':
            newStatus = 'pending';
            backgroundColor = ''; // Reset background color for pending tasks
            break;
        case 'task_processing':
            newStatus = 'processing';
            backgroundColor = 'yellow'; // Set background color for processing tasks
            break;
        case 'task_completed':
            newStatus = 'completed';
            backgroundColor = 'green'; // Set background color for completed tasks
            break;
        default:
            newStatus = '';
            backgroundColor = '';
    }

    // Update background color of the target container
    targetContainer.style.backgroundColor = backgroundColor;

    // Send API request to update the task status
    fetch(`${BACKEND_URL}/update/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update task status');
        }
        // Optionally handle success response
    })
    .catch(error => {
        console.error('Error updating task status:', error);
        // Optionally handle error
    });
}


function fetchData(pageNo){
    const task_pending=document.getElementById("task_pending");
    const task_processing=document.getElementById("task_processing");
    const task_completed=document.getElementById("task_completed")
    task_pending.innerHTML='';
    task_completed.innerHTML='';
    task_processing.innerHTML='';
    const noOfProducts = document.getElementById('no_of_products').value;
    fetch(`${BACKEND_URL}/fetch?start=${pageNo-1}&no_of_products=${noOfProducts}`)
    .then(res=>{
        if(res.status==200){
            return res.json();
        }
    })
    .then(data=>{
        arr=data.data;
        console.log(arr);
        arr.forEach(element => {
            displayTasks(element)
        });

    })
    .catch(err=>{
        console.log(err)
    })
}
fetchData(1)

function displayTasks(element){
    const task_pending=document.getElementById("task_pending");
    const task_processing=document.getElementById("task_processing");
    const task_completed=document.getElementById("task_completed")
  

    var newTask = document.createElement("div");
        newTask.className = "item";
        newTask.id = "task_" + element.id; // Unique ID for each task
        newTask.innerHTML = `
            <p>Title:${element.title}</p>
            <p>Description:${element.description}</p>
            <p>Start Date:${new Date(element.start_date).toDateString()}</p>
            <p>Start Time:${element.start_time}</p>
            <p>End Time:${element.end_time}</p>
            <p>End Date:${new Date(element.end_date).toDateString()}</p>
            <button onclick="openEditPopup(${element.id}, '${element.title}', '${element.description}', '${element.start_date}', '${element.start_time}', '${element.end_time}', '${element.end_date}')">Edit</button>
            <button onclick="deleteTask('${element.id}')">Delete</button>
        `;
        newTask.draggable = true;
        newTask.addEventListener("dragstart", drag);
        if(element.status=='pending')
        task_pending.appendChild(newTask);
        else if(element.status=='processing')
        task_processing.appendChild(newTask)
        else if(element.status=='completed')
        task_completed.appendChild(newTask)

}


// Open edit popup
// Open edit popup
function openEditPopup(taskId, taskName, taskDescription, taskDate, startTime, endTime, endDate) {
    const container = document.getElementById('editPopup');
    const editContainer = document.createElement('div');
    editContainer.className = "edit-popup-content";
    editContainer.innerHTML = `
            <span class="close" onclick="closeEditPopup()">&times;</span>
            <div class="form_group">
                <input type="text" placeholder="Enter task" id="editTaskName">
                <input type="text" placeholder="Enter description" id="editTaskDescription">
                <input type="date" id="editTaskDate">
                <input type="time" id="editStartTime">
                <input type="time" id="editEndTime">
                <input type="date" id="editTaskEndDate">
                <button onclick="updateTask(${taskId})">Update</button>
            </div>
    `;
    container.innerHTML = ''; // Clear previous content
    container.appendChild(editContainer);
    document.getElementById("editTaskName").value = taskName;
    document.getElementById("editTaskDescription").value = taskDescription;
    document.getElementById("editTaskDate").value = new Date(taskDate).toISOString().split('T')[0];;
    document.getElementById("editStartTime").value = startTime;
    document.getElementById("editEndTime").value = endTime;
    document.getElementById("editTaskEndDate").value = new Date(endDate).toISOString().split('T')[0];;
    document.getElementById("editPopup").style.display = "block";
}


// Close edit popup
function closeEditPopup() {
    document.getElementById("editPopup").style.display = "none";
}

// Update task
function updateTask(taskId) {
    const updatedTaskName = document.getElementById("editTaskName").value;
    const updatedTaskDescription = document.getElementById("editTaskDescription").value;
    const updatedTaskDate = document.getElementById("editTaskDate").value;
    const updatedStartTime = document.getElementById("editStartTime").value;
    const updatedEndTime = document.getElementById("editEndTime").value;
    const updatedTaskEndDate = document.getElementById("editTaskEndDate").value;

    const updatedTask = {
        id: taskId,
        title: updatedTaskName,
        description: updatedTaskDescription,
        start_date: updatedTaskDate,
        start_time: updatedStartTime,
        end_time: updatedEndTime,
        end_date: updatedTaskEndDate
    };

    fetch(`${BACKEND_URL}/update/${taskId}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
    })
    .then(response => {
        if (response.ok) {
            // Update the task in the UI
            const taskElement = document.getElementById(`task_${taskId}`);
            taskElement.querySelector('p:nth-child(1)').textContent = `Title: ${updatedTaskName}`;
            taskElement.querySelector('p:nth-child(2)').textContent = `Description: ${updatedTaskDescription}`;
            taskElement.querySelector('p:nth-child(3)').textContent = `Start Date: ${new Date(updatedTaskDate).toDateString()}`;
            taskElement.querySelector('p:nth-child(4)').textContent = `Start Time: ${updatedStartTime}`;
            taskElement.querySelector('p:nth-child(5)').textContent = `End Time: ${updatedEndTime}`;
            taskElement.querySelector('p:nth-child(6)').textContent = `End Date: ${new Date(updatedTaskEndDate).toDateString()}`;

            // Close edit popup
            closeEditPopup();
        } else {
            console.error('Failed to update task');
        }
    })
    .catch(error => console.error('Error updating task:', error));
}

// Delete task
function deleteTask(taskId) {
    fetch(`${BACKEND_URL}/delete/${taskId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            // Remove the task from the UI
            const taskElement = document.getElementById(`task_${taskId}`);
            taskElement.remove();
        }
    })
    .catch(error => console.error('Error deleting task:', error));
}

let totalTasks;

async function getTotalNoofTasks(){
    await fetch(`${BACKEND_URL}/todos/total`)
            .then(res=>res.json())
            .then(data=>{
                totalTasks=data.total
                console.log("totalTasks",totalTasks)
            })
            .catch(err=>console.log(err));
}
getTotalNoofTasks()
function createPagination(items, itemperPage) {
    console.log(items, itemperPage)
    {
      $('#pagination').pagination({
        items: items,
        itemsOnPage: itemperPage,
        onPageClick: function (pageNo) {
            fetchData(pageNo);
        }
      });
    }
  }
  createPagination(totalTasks,10);

  noOfProducts.addEventListener('change', () => {
    createPagination(totalTasks, noOfProducts.value);
    fetchData(1);
  });