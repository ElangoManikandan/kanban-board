import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend"; // Importing HTML5Backend
import { TouchBackend } from "react-dnd-touch-backend";  // Correct import



const columnLimits = {
  "in-progress": 3,
  done: 5,
};

const priorities = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-200 text-red-800",
};

const initialColumns = {
  "to-do": [],
  "in-progress": [],
  done: [],
};

const columnNames = {
  "to-do": "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

const ItemTypes = {
  TASK: "task",
};

const Task = ({ task, index, columnId, moveTask, onEdit, onDelete, onVerify }) => {
  const [, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { task, index, columnId },
  });

  return (
    <div
      ref={drag}
      className={`mb-3 p-3 rounded-lg shadow-md ${priorities[task.priority]} text-sm relative`}
    >
      <div className="font-semibold text-gray-800">{task.title}</div>
      <div className="text-gray-700">{task.description}</div>
      <div className="text-xs italic text-gray-600">{task.priority.toUpperCase()}</div>
      {columnId === "done" && (
        <label className="text-xs mt-1 flex items-center gap-1">
          <input
            type="checkbox"
            checked={task.verified}
            onChange={() => onVerify(task.id)}
          />
          Verified
        </label>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <button
          className="text-xs text-blue-600 hover:underline"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          className="text-xs text-red-600 hover:underline"
          onClick={() => onDelete(columnId, task)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const Column = ({ columnId, tasks, moveTask, onEdit, onDelete, onVerify }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => {
      if (item.columnId !== columnId) {
        moveTask(item, columnId);
      }
    },
  });

  return (
    <div
      ref={drop}
      className={`bg-white p-4 rounded-xl shadow-lg min-h-[200px] transition-all duration-300 ${
        columnLimits[columnId] && tasks.length >= columnLimits[columnId]
          ? "border-2 border-red-400"
          : "hover:scale-[1.01]"
      }`}
    >
      <h2 className="text-xl font-semibold mb-3 text-center text-indigo-700">
        {columnNames[columnId]}
      </h2>
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          index={index}
          columnId={columnId}
          moveTask={moveTask}
          onEdit={onEdit}
          onDelete={onDelete}
          onVerify={onVerify}
        />
      ))}
    </div>
  );
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const [modalTask, setModalTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "low" });
  const [deleteModal, setDeleteModal] = useState(null); // { columnId, task }

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("Please provide a title and description.");
      return;
    }
    const task = {
      id: uuidv4(),
      ...newTask,
      status: "to-do",
      verified: false,
    };
    setColumns((prev) => ({
      ...prev,
      "to-do": [...prev["to-do"], task],
    }));
    console.log(task); // Sample JSON output
    setNewTask({ title: "", description: "", priority: "low" });
  };

  const confirmDeleteTask = () => {
    const { columnId, task } = deleteModal;
    if (columnId === "done" && !task.verified) {
      alert("This task must be verified to delete.");
      setDeleteModal(null);
      return;
    }

    setColumns((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((t) => t.id !== task.id),
    }));
    setDeleteModal(null);
  };

  const handleEditTask = (updatedTask) => {
    setColumns((prev) => {
      const newCols = { ...prev };
      for (const col in newCols) {
        newCols[col] = newCols[col].map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
      }
      return newCols;
    });
    setModalTask(null);
  };

  const handleVerifyTask = (taskId) => {
    setColumns((prev) => {
      const newCols = { ...prev };
      newCols["done"] = newCols["done"].map((task) =>
        task.id === taskId ? { ...task, verified: !task.verified } : task
      );
      return newCols;
    });
  };

const moveTask = (item, targetColumnId) => {
  const { task, index, columnId } = item;

  setColumns((prev) => {
    const sourceColumn = [...prev[columnId]];
    const destColumn = [...prev[targetColumnId]];

    // Check column limit
    if (columnLimits[targetColumnId] && destColumn.length >= columnLimits[targetColumnId]) {
      alert(`Cannot move task. '${columnNames[targetColumnId]}' column limit reached.`);
      return prev; // Don't update state if limit reached
    }

    sourceColumn.splice(index, 1);
    const movedTask = { ...task, status: targetColumnId };
    destColumn.push(movedTask);
    
    console.log(JSON.stringify({
      id: movedTask.id,
      title: movedTask.title,
      description: movedTask.description,
      status: movedTask.status,
      priority: movedTask.priority,
      verified: movedTask.verified,
    }, null, 2));

    return {
      ...prev,
      [columnId]: sourceColumn,
      [targetColumnId]: destColumn,
    };
  });
};

  
  const getBackend = () => {
    // Check if touch device
    return window.innerWidth <= 768 ? TouchBackend : HTML5Backend;
  };

  return (
    <DndProvider
      backend={MultiBackend}
      options={{
        backends: [
          {
            id: "html5",
            backend: HTML5Backend, // Use HTML5Backend for desktop
          },
          {
            id: "touch",
            backend: TouchBackend, // Use TouchBackend for mobile
          },
        ],
      }}
    >
 <div
  className="p-6 min-h-screen bg-cover bg-center"
  style={{ backgroundImage: "url('/bg.jpg')" }}
>
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 drop-shadow">
         Kanban Board
        </h1>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="bg-white p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300"
          />
          <input
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="bg-white p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300"
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            className="bg-white p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
  onClick={handleAddTask}
  disabled={!newTask.title.trim() || !newTask.description.trim()}
  className="col-span-1 sm:col-span-3 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mt-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
>
  ➕ Add Task
</button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.keys(columns).map((colKey) => (
            <Column
              key={colKey}
              columnId={colKey}
              tasks={columns[colKey]}
              moveTask={moveTask}
              onEdit={(task) => setModalTask(task)}
              onDelete={(columnId, task) => setDeleteModal({ columnId, task })}
              onVerify={handleVerifyTask}
            />
          ))}
        </div>

        {/* Edit Task Modal */}
        {modalTask && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-indigo-700">Edit Task</h2>
              <input
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                value={modalTask.title}
                onChange={(e) => setModalTask({ ...modalTask, title: e.target.value })}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                value={modalTask.description}
                onChange={(e) => setModalTask({ ...modalTask, description: e.target.value })}
              />
              <select
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                value={modalTask.priority}
                onChange={(e) => setModalTask({ ...modalTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalTask(null)}
                  className="px-3 py-1 bg-gray-300 rounded shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditTask(modalTask)}
                  className="px-3 py-1 bg-indigo-500 text-white rounded shadow"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-red-600">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete this task?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-1 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="px-4 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
