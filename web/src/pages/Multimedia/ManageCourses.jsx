// src/components/ManageCourses.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/courses");
      console.log(response.data);
      setCourses(response.data);
    } catch (err) {
      setError("Failed to fetch courses");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Your Courses</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="border p-4 rounded">
              <h3 className="text-lg font-bold">{course.name}</h3>
              <p className="mb-2">{course.description}</p>
              {course.sections.map((section) => (
                <div key={section.id} className="ml-4 mb-4">
                  <h4 className="font-semibold">{section.title}</h4>
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className="ml-4 mb-2">
                      <p className="font-medium">{lesson.title}</p>
                      <p>{lesson.description}</p>
                      <video width="320" height="240" controls>
                        <source src={lesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
