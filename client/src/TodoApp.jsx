import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await axios.get('http://192.168.1.7:5000/todos');
                setTodos(response.data);
            } catch (error) {
                console.error('Error fetching todos:', error);
            }
        };
        fetchTodos();
    }, []);

    const addTodo = async () => {
        if (!newTodo.trim()) return;
        try {
            const response = await axios.post('http://192.168.1.7:5000/todos', { text: newTodo });
            setTodos([...todos, response.data]);
            setNewTodo('');
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const toggleTodo = async (id) => {
        const todo = todos.find(todo => todo.id === id);
        const updatedTodo = { ...todo, completed: !todo.completed };
        try {
            await axios.put(`http://192.168.1.7:5000/todos/${id}`, updatedTodo);
            setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const deleteTodo = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this todo?');
        if (!confirmDelete) return;
        try {
            await axios.delete(`http://192.168.1.7:5000/todos/${id}`);
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const deleteTodoAll = async (id) => {
            await axios.delete(`http://192.168.1.7:5000/todos/${id}`);
            setTodos(todos.filter(todo => todo.id !== id));
    };

    const startEditing = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
    };

    const saveEdit = async (id) => {
        if (!editText.trim()) {
            deleteTodo(id);
            return;
        }
        const updatedTodo = { id, text: editText, completed: todos.find(todo => todo.id === id).completed };
        try {
            await axios.put(`http://192.168.1.7:5000/todos/${id}`, updatedTodo);
            setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
            setEditingId(null);
            setEditText('');
        } catch (error) {
            console.error('Error saving edit:', error);
        }
    };

    const filteredTodos = todos.filter(todo =>   {
        if (filter === 'all') return true;
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

const clearCompleted = async () => {
    const confirmDeletion = window.confirm("Are you sure you want to delete all completed tasks?");
    if (!confirmDeletion) return;
    try {
        const completedTodos = todos.filter(todo => todo.completed);
        await Promise.all(completedTodos.map(todo => deleteTodoAll(todo.id)));
        setTodos(todos.filter(todo => !todo.completed));
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
};

    const itemsLeft = todos.filter(todo => !todo.completed).length;
    const completedTodosCount = todos.filter(todo => todo.completed).length;

    return (
        <div className="bg-green-700 h-screen py-5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-3">
                    <h1 className="text-3xl font-bold text-white">IT-DAILY TASK</h1>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                                placeholder="Mga kailangan gawin?"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={addTodo}
                                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <ul className="divide-y divide-gray-200">
                        {filteredTodos.length === 0 ? (
                            <li className="py-8 text-center text-gray-500">
                                {filter === 'all' 
                                    ? 'No todos yet. Add one above!' 
                                    : filter === 'active' 
                                        ? 'No active tasks!'
                                        : 'No completed tasks!'}
                            </li>
                        ) : (
                            filteredTodos.map(todo => (
                                <li key={todo.id} className="px-4 py-3 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => toggleTodo(todo.id)}
                                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    {editingId === todo.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                                                onBlur={() => saveEdit(todo.id)}
                                                autoFocus
                                                className="ml-3 flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                onClick={() => saveEdit(todo.id)}
                                                className="ml-2 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span 
                                                onClick={() => toggleTodo(todo.id)}
                                                className={`ml-3 flex-1 ${todo.completed ? 'completed' : ''}`}
                                            >
                                                {todo.text}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => startEditing(todo)}
                                                    className="px-2 py-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteTodo(todo.id)}
                                                    className="px-2 py-1 text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                        <div className="mb-2 sm:mb-0">
                            {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
                        </div>
                        <div className="flex space-x-2 mb-2 sm:mb-0">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('active')}
                                className={`px-2 py-1 rounded ${filter === 'active' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-2 py-1 rounded ${filter === 'completed' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                            >
                                Completed
                            </button>
                        </div>
                        <button
                            onClick={clearCompleted}
                            className='px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            disabled={completedTodosCount === 0}
                        >
                            Clear completed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodoApp;
