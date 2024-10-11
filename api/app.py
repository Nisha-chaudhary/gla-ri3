from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import cloudinary
import cloudinary.uploader
import cloudinary.api

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['course_management']
courses_collection = db['courses']

# Cloudinary configuration
cloudinary.config(
    cloud_name = "dbuekgcny",
    api_key = "647672224555625",
    api_secret = "CUUf-kqt2CQRbxOFIC94zMCohws"
)

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['POST'])
def create_course():
    try:
        course_data = {
            'title': request.form['courseTitle'],
            'description': request.form['courseDescription'],
            'sections': eval(request.form['sections'])  # Be cautious with eval, consider using json.loads instead
        }

        # Handle file uploads
        for key, file in request.files.items():
            if file and allowed_file(file.filename):
                # Upload file to Cloudinary
                upload_result = cloudinary.uploader.upload(file,
                                                           resource_type="video",
                                                           folder="course_videos")

                # Update the course data with the Cloudinary URL
                section_index, lesson_index = map(int, key.split('_')[1:])
                course_data['sections'][section_index]['lessons'][lesson_index]['videoUrl'] = upload_result['secure_url']

        # Insert the course into the database
        result = courses_collection.insert_one(course_data)
        return jsonify({"message": "Course created successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/courses', methods=['GET'])
def get_courses():
    courses = list(courses_collection.find())
    for course in courses:
        course['_id'] = str(course['_id'])
    return jsonify(courses), 200

@app.route('/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    course = courses_collection.find_one({'_id': ObjectId(course_id)})
    if course:
        course['_id'] = str(course['_id'])
        return jsonify(course), 200
    return jsonify({"error": "Course not found"}), 404

@app.route('/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    try:
        course_data = request.json
        result = courses_collection.update_one({'_id': ObjectId(course_id)}, {'$set': course_data})
        if result.modified_count:
            return jsonify({"message": "Course updated successfully"}), 200
        return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    course = courses_collection.find_one({'_id': ObjectId(course_id)})
    if course:
        # Delete associated videos from Cloudinary
        for section in course.get('sections', []):
            for lesson in section.get('lessons', []):
                if 'videoUrl' in lesson:
                    # Extract public_id from the URL
                    public_id = lesson['videoUrl'].split('/')[-1].split('.')[0]
                    cloudinary.uploader.destroy(public_id, resource_type="video")

        result = courses_collection.delete_one({'_id': ObjectId(course_id)})
        if result.deleted_count:
            return jsonify({"message": "Course and associated videos deleted successfully"}), 200
    return jsonify({"error": "Course not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)