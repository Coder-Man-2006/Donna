import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../login/firebaseConfig'; // Firestore config file
import './TaskTable.css'; // CSS for table styling

interface Task {
  id?: string;
  name: string;
  deadline: string;
  priority: string;
  duration: string;
  status: string;
  section: string;
}

const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sections, setSections] = useState<string[]>(['Default']);
  const [currentSection, setCurrentSection] = useState<string>('Default');
  const [newSectionName, setNewSectionName] = useState<string>('');
  const tasksCollection = collection(db, 'tasks'); // Firestore collection reference

  // Fetch tasks and sections from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(fetchedTasks);

      // Dynamically set sections based on fetched tasks
      const fetchedSections = Array.from(
        new Set(fetchedTasks.map((task) => task.section))
      );
      setSections(fetchedSections.length > 0 ? fetchedSections : ['Default']);
    });
    return () => unsubscribe();
  }, []);

  // Add a new section
  const addSection = () => {
    if (newSectionName.trim() && !sections.includes(newSectionName.trim())) {
      setSections([...sections, newSectionName.trim()]);
      setCurrentSection(newSectionName.trim());
      setNewSectionName('');
    }
  };

  // Delete a section
  const deleteSection = async (sectionName: string) => {
    if (sectionName === 'Default') {
      alert('Cannot delete the default section.');
      return;
    }

    // Move tasks in the section to "Default" before deleting
    const tasksToMove = tasks.filter((task) => task.section === sectionName);
    const defaultSection = 'Default';

    for (const task of tasksToMove) {
      if (task.id) {
        const taskRef = doc(db, 'tasks', task.id);
        await setDoc(taskRef, { ...task, section: defaultSection });
      }
    }

    // Update the local task state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.section === sectionName ? { ...task, section: defaultSection } : task
      )
    );

    // Remove the section locally
    setSections((prevSections) => prevSections.filter((sec) => sec !== sectionName));
    if (currentSection === sectionName) setCurrentSection('Default');
  };

  // Add a new task
  const addTask = async () => {
    const newTask: Task = {
      name: 'New Task',
      deadline: '',
      priority: 'Medium',
      duration: '1 hour',
      status: 'not started',
      section: currentSection,
    };
    const docRef = await addDoc(tasksCollection, newTask);
    setTasks([...tasks, { ...newTask, id: docRef.id }]);
  };

  // Update a task
  const updateTask = async (updatedTask: Task) => {
    if (updatedTask.id) {
      const taskRef = doc(db, 'tasks', updatedTask.id);
      await setDoc(taskRef, updatedTask);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Handle editing a field directly in the table
  const handleEdit = (id: string, field: keyof Task, value: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
    const updatedTask = updatedTasks.find((task) => task.id === id);
    if (updatedTask) updateTask(updatedTask);
  };

  return (
    <div>
      {/* Section Tabs */}
      <div className="tab-container">
        {sections.map((section) => (
          <div
            key={section}
            className={`tab ${section === currentSection ? 'active' : ''}`}
          >
            <span onClick={() => setCurrentSection(section)}>{section}</span>
            {section !== 'Default' && (
              <button
                className="delete-section-button"
                onClick={() => deleteSection(section)}
              >
                <i className="bx bx-trash"></i>
              </button>
            )}
          </div>
        ))}
        <div className="tab">
          <input
            type="text"
            placeholder="New Section"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSection()}
          />
          <button onClick={addSection}>+</button>
        </div>
      </div>

      {/* Task Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Deadline</th>
            <th>Priority</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks
            .filter((task) => task.section === currentSection)
            .map((task) => (
              <tr key={task.id}>
                <td>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) =>
                      handleEdit(task.id!, 'name', e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={task.deadline}
                    onChange={(e) =>
                      handleEdit(task.id!, 'deadline', e.target.value)
                    }
                  />
                </td>
                <td>
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      handleEdit(task.id!, 'priority', e.target.value)
                    }
                  >
                    <option value="ASAP">ASAP</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={task.duration}
                    onChange={(e) =>
                      handleEdit(task.id!, 'duration', e.target.value)
                    }
                  />
                </td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleEdit(task.id!, 'status', e.target.value)
                    }
                  >
                    <option value="working on it">Working on it</option>
                    <option value="procrastinating">Procrastinating</option>
                    <option value="not started">Not started</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => deleteTask(task.id!)}>
                    <i className="bx bx-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Add Task Button */}
      <button onClick={addTask} className="add-task-button">
        Add Task
      </button>
    </div>
  );
};

export default TaskTable;
