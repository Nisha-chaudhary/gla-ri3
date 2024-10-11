// src/components/CourseForm.jsx

import React, { useState } from "react";
import { PlusCircle, Save } from "lucide-react";
import axios from "axios";
import ManageCourses from "./ManageCourses";

export default function CourseForm() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [sections, setSections] = useState([{ title: "", lessons: [] }]);
  const [activeTab, setActiveTab] = useState("create");
  const [message, setMessage] = useState("");

  const addSection = () => {
    setSections([...sections, { title: "", lessons: [] }]);
  };

  const addLesson = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.push({
      title: "",
      description: "",
      videoFile: null,
    });
    setSections(newSections);
  };

  const handleSectionTitleChange = (index, title) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };

  const handleLessonChange = (sectionIndex, lessonIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons[lessonIndex][field] = value;
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare FormData
    const formData = new FormData();
    formData.append("courseTitle", courseTitle);
    formData.append("courseDescription", courseDescription);
    formData.append(
      "sections",
      JSON.stringify(
        sections.map((sec, secIndex) => ({
          ...sec,
          index: secIndex,
        }))
      )
    );

    // Append video files
    sections.forEach((section, secIndex) => {
      section.lessons.forEach((lesson, lessonIndex) => {
        if (lesson.videoFile) {
          formData.append(`video_${secIndex}_${lessonIndex}`, lesson.videoFile);
        }
      });
    });

    try {
      const response = await axios.post("http://127.0.0.1:5000/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
      // Reset form
      setCourseTitle("");
      setCourseDescription("");
      setSections([{ title: "", lessons: [] }]);
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 ${
              activeTab === "create"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create Course
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "manage"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            Manage Courses
          </button>
        </div>
      </div>
      {activeTab === "create" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <div className="text-green-500">{message}</div>}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Course Details</h2>
            <input
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Course Title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Course Description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white shadow rounded-lg p-6">
              <input
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Section Title"
                value={section.title}
                onChange={(e) =>
                  handleSectionTitleChange(sectionIndex, e.target.value)
                }
                required
              />
              {section.lessons.map((lesson, lessonIndex) => (
                <div
                  key={lessonIndex}
                  className="mb-4 p-4 border border-gray-200 rounded"
                >
                  <input
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    placeholder="Lesson Title"
                    value={lesson.title}
                    onChange={(e) =>
                      handleLessonChange(
                        sectionIndex,
                        lessonIndex,
                        "title",
                        e.target.value
                      )
                    }
                    required
                  />
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    placeholder="Lesson Description"
                    value={lesson.description}
                    onChange={(e) =>
                      handleLessonChange(
                        sectionIndex,
                        lessonIndex,
                        "description",
                        e.target.value
                      )
                    }
                    required
                    rows={3}
                  />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleLessonChange(
                        sectionIndex,
                        lessonIndex,
                        "videoFile",
                        e.target.files[0]
                      )
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addLesson(sectionIndex)}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Lesson
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Section
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <Save className="mr-2 h-4 w-4" /> Save Course
          </button>
        </form>
      ) : (
        <ManageCourses />
      )}
    </div>
  );
}
