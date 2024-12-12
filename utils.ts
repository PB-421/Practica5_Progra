import { Collection } from "mongodb";
import { Courses, CoursesModel, CoursesMostrar, Student, StudentModel, StudentMostrar, Teacher, TeacherModel, TeacherMostrar } from "./types.ts";
import { ObjectId } from "mongodb";

export async function fromIdToStudentArray(ids: string[],lista:Collection<StudentModel>):Promise<Student[]> {
    const IDs = ids.map((elem) => new ObjectId(elem))
    const alumnosM = await lista.find({_id: {$in: IDs}}).toArray()
    const alumnos = alumnosM.map((elem) => fromModelToStudent(elem))
    return alumnos
}

export async function fromIdToTeacher(id: string,lista: Collection<TeacherModel>):Promise<Teacher> {
    const teacherL = await lista.find({_id: new ObjectId(id)}).toArray()
    const teacher = teacherL[0]
    return fromModelToTeacher(teacher)
}

export function fromModelToStudent(studentOG:StudentModel):Student {
    return {
        id: studentOG._id!.toString(),
        name: studentOG.name,
        email: studentOG.email,
        enrolledCourses: studentOG.enrolledCourses.map((elem) => elem.toHexString())
    }
}

export async function fromModelToCoursesMostrar(courseOG:CoursesModel,listaS:Collection<StudentModel>,listaT: Collection<TeacherModel>):Promise<CoursesMostrar> {
    const students = courseOG.studentsId
    const studentsS = students.map((elem) => elem.toHexString())
    const studentsOB:Student[] = await fromIdToStudentArray(studentsS,listaS)

    if(!courseOG.teacherId){
        return {
            id: courseOG._id!.toString(),
            title: courseOG.title,
            description: courseOG.description,
            teacherId: null,
            studentsId: studentsOB
        }
    }
    return {
        id: courseOG._id!.toString(),
        title: courseOG.title,
        description: courseOG.description,
        teacherId: await fromIdToTeacher(courseOG.teacherId.toString(),listaT),
        studentsId: studentsOB
    }
}

export async function fromIdToCourseArray(ids: string[],lista:Collection<CoursesModel>):Promise<Courses[]> {
    const IDs = ids.map((elem) => new ObjectId(elem))
    const cursosM = await lista.find({_id: {$in: IDs}}).toArray()
    const cursos = cursosM.map((elem) => fromModelToCourse(elem))
    return cursos
}

export function fromModelToCourse(courseOG:CoursesModel):Courses {
    return {
        id: courseOG._id!.toString(),
        title: courseOG.title,
        description: courseOG.description,
        teacherId: courseOG.teacherId.toString(),
        studentsId: courseOG.studentsId.map((elem) => elem.toHexString())
    }
}

export async function fromModelToStudentMostrar(studentOG: StudentModel,listaC:Collection<CoursesModel>):Promise<StudentMostrar> {
    const courses = studentOG.enrolledCourses
    const coursesS = courses.map((elem) => elem.toHexString())
    const coursesOB = await fromIdToCourseArray(coursesS,listaC)
    return {
        id: studentOG._id!.toString(),
        name: studentOG.name,
        email: studentOG.email,
        enrolledCourses: coursesOB
    }
}

function fromModelToTeacher(teacherOG: TeacherModel):Teacher {
    return {
        id: teacherOG._id!.toString(),
        name: teacherOG.name,
        email: teacherOG.email,
        coursesTaught: teacherOG.coursesTaught.map((elem) => elem.toHexString())
    }
}

export async function fromModelToTeacherMostrar(teacherOG: TeacherModel, listaC:Collection<CoursesModel>):Promise<TeacherMostrar> {
    const courses = teacherOG.coursesTaught
    const coursesS = courses.map((elem) => elem.toHexString())
    const coursesOB = await fromIdToCourseArray(coursesS,listaC)
    return {
        id: teacherOG._id!.toString(),
        name: teacherOG.name,
        email: teacherOG.email,
        coursesTaught: coursesOB
    }
}

export async function comprobarCurso(id: string,lista: Collection<CoursesModel>):Promise<boolean> {
    if(!ObjectId.isValid(id)){
        return false
    }
    const curso = await lista.findOne({_id: new ObjectId(id)})
    if(!curso){
        return false
    }
    return true
}

export async function comprobarEstudiante(id: string, lista: Collection<StudentModel>):Promise<boolean> {
    if(!ObjectId.isValid(id)){
        return false
    }
    const estudiante = await lista.findOne({_id: new ObjectId(id)})
    if(!estudiante){
        return false
    }
    return true
}

export async function comprobarProfesor(id: string, lista: Collection<TeacherModel>):Promise<boolean> {
    if(!ObjectId.isValid(id)){
        return false
    }
    const profesor = await lista.findOne({_id: new ObjectId(id)})
    if(!profesor){
        return false
    }
    return true
}