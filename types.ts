import {ObjectId} from "mongodb"

export type StudentModel = {
    _id?: ObjectId,
    name: string,
    email: string,
    enrolledCourses: ObjectId[] //de courses
}

export type CoursesModel = {
    _id?: ObjectId,
    title: string,
    description: string,
    teacherId: ObjectId,
    studentsId: ObjectId[]  //de estudiantes
}

export type TeacherModel = {
    _id?: ObjectId,
    name: string,
    email: string,
    coursesTaught: ObjectId[] //de courses
}

export type Student = {
    id: string
    name: string,
    email: string,
    enrolledCourses: string[] //de courses
}

export type StudentMostrar = {
    id: string
    name: string,
    email: string,
    enrolledCourses: Courses[] //de courses
}

export type Courses = {
    id: string,
    title: string,
    description: string,
    teacherId: string,
    studentsId: string[]  //de estudiantes
}

export type CoursesMostrar = {
    id: string,
    title: string,
    description: string,
    teacherId: Teacher | null,
    studentsId: Student[]  //de estudiantes
}

export type Teacher = {
    id: string,
    name: string,
    email: string,
    coursesTaught:string[] //de courses
}

export type TeacherMostrar = {
    id: string,
    name: string,
    email: string,
    coursesTaught:Courses[] //de courses
}