import { Collection, ObjectId } from "mongodb";
import { CoursesModel,CoursesMostrar, StudentModel, StudentMostrar, TeacherModel, TeacherMostrar } from "./types.ts";
import {  comprobarProfesor, fromIdToTeacher, fromModelToCoursesMostrar, fromModelToStudentMostrar, fromModelToTeacherMostrar } from "./utils.ts";

type Argsstudinates = {
    id:string|null,
    name: string|null,
    email: string|null,
    enrolledCourses: string[]|null 
} 
type Argsteachers={
    id:string|null
    name: string|null,
    email: string|null,
    coursesTaught: string[]|null
}
type Argscourses={
    id: string|null,
    title: string|null,
    description: string|null,
    teacherId: string|null,
    studentsId: string[]|null
}

export const resolvers={
    Query: {
     students: async (_:unknown,_args:unknown,context:{coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<StudentMostrar[]> => {
        const coursedb=await context.studentcollection.find().toArray()
        const course=await Promise.all(coursedb.map((c)=>fromModelToStudentMostrar(c,context.coursecollection)))
        return course
     },
     student: async (_:unknown,args: {id: string},context:{coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<StudentMostrar | null> => {
        const coursedb=await context.studentcollection.findOne({_id: new ObjectId(args.id)})
        if(!coursedb){
            return null
        }
        const course= fromModelToStudentMostrar(coursedb,context.coursecollection)
        return course
     },
     teachers: async (_:unknown,_args:unknown,context:{coursecollection:Collection<CoursesModel>,teachercollection:Collection<TeacherModel>}):Promise<TeacherMostrar[]> => {
        const coursedb=await context.teachercollection.find().toArray()
        const course=await Promise.all(coursedb.map((c)=>fromModelToTeacherMostrar(c,context.coursecollection)))
        return course
     },
     teacher: async (_:unknown,args: {id: string},context:{coursecollection:Collection<CoursesModel>,teachercollection:Collection<TeacherModel>}):Promise<TeacherMostrar | null> => {
        const coursedb=await context.teachercollection.findOne({_id: new ObjectId(args.id)})
        if(!coursedb){
            return null
        }
        const course= fromModelToTeacherMostrar(coursedb,context.coursecollection)
        return course
     },
     courses: async(_:unknown,_args: unknown,context:{coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>,teachercollection:Collection<TeacherModel>}):Promise<CoursesMostrar[]> => {
        const coursedb=await context.coursecollection.find().toArray()
        const course=await Promise.all(coursedb.map((c)=>fromModelToCoursesMostrar(c,context.studentcollection,context.teachercollection)))
        return course
     },
     course:async(_:unknown,args:Argscourses,context:{coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>,teachercollection:Collection<TeacherModel>}):Promise<CoursesMostrar|null>=>{
        if(args.id){
        const coursedb=await context.coursecollection.findOne({_id:new ObjectId(args.id)})
        if(!coursedb){
            return null
        }
        const course=await fromModelToCoursesMostrar(coursedb,context.studentcollection,context.teachercollection)
        return course
        }
        return null
    }
    },
    Mutation: {
        createStudent: async(_:unknown,args: Argsstudinates,context:{studentcollection:Collection<StudentModel>,coursecollection:Collection<CoursesModel>}):Promise<StudentMostrar | null> => {
            if(args.name && args.email){
                const {insertedId} = await context.studentcollection.insertOne({
                    name: args.name,
                    email: args.email,
                    enrolledCourses: []
                })
                return {
                    id: insertedId.toString(),
                    name: args.name,
                    email: args.email,
                    enrolledCourses: []
                }
            }
            return null
        },
        createTeacher: async(_:unknown,args: Argsteachers,context:{teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>}):Promise<TeacherMostrar | null> => {
            if(args.name && args.email){
                const {insertedId} = await context.teachercollection.insertOne({
                    name: args.name,
                    email: args.email,
                    coursesTaught: []
                })
                return {
                    id: insertedId.toString(),
                    name: args.name,
                    email: args.email,
                    coursesTaught: []
                }
            }
            return null
        },
        createCourse: async(_:unknown,args: Argscourses,context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<CoursesMostrar | null> => {
            if(args.title && args.description && args.teacherId){
                if(!comprobarProfesor(args.teacherId,context.teachercollection)){
                    return null
                }
                const {insertedId} = await context.coursecollection.insertOne({
                    title: args.title,
                    description: args.description,
                    teacherId: new ObjectId(args.teacherId),
                    studentsId: []
                })
                await context.teachercollection.updateOne({_id: new ObjectId(args.teacherId)},
                {$push: {coursesTaught: insertedId}})
                return {
                    id: insertedId.toString(),
                    title: args.title,
                    description: args.description,
                    teacherId: await fromIdToTeacher(args.teacherId,context.teachercollection),
                    studentsId: []
                }
            }
            return null
        },
        updateStudent:async(_:unknown,args:Argsstudinates,context:{teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<StudentMostrar|null> =>{
            if(args.id){
                let student = await context.studentcollection.findOne({_id: new ObjectId(args.id)})
                if(!student){
                    return null
                }
                const set = {
                    name: args.name ?? student.name,
                    email: args.email ?? student.email
                }
                await context.studentcollection.updateOne({_id: new ObjectId(args.id)},
                {$set: set})
                student = await context.studentcollection.findOne({_id: new ObjectId(args.id)})
                if(!student){
                    return null
                }
                return fromModelToStudentMostrar(student,context.coursecollection)
            }
            return null
        },
        updateTeacher: async(_:unknown,args: Argsteachers,context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<TeacherMostrar | null> => {
            if(args.id){
                let teacher = await context.teachercollection.findOne({_id: new ObjectId(args.id)})
                if(!teacher){
                    return null
                }
                const set = {
                    name: args.name ?? teacher.name,
                    email: args.email ?? teacher.email
                }
                await context.teachercollection.updateOne({_id: new ObjectId(args.id)},
                {$set: set})
                teacher = await context.teachercollection.findOne({_id: new ObjectId(args.id)})
                if(!teacher){
                    return null
                }
                return fromModelToTeacherMostrar(teacher,context.coursecollection)
            }
            return null
        },
        updateCourse: async(_:unknown,args: Argscourses,context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<CoursesMostrar | null> => {
            if(args.id){
                let course=await context.coursecollection.findOne({_id:new ObjectId(args.id)})
                let teacId = null
                if(!course){
                    return null
                }
                const teachAnt = course.teacherId
                if(args.teacherId){
                    if(!await comprobarProfesor(args.teacherId,context.teachercollection)){
                        return null
                    }
                    teacId = new ObjectId(args.teacherId)
                } else {
                    teacId = null
                }
                const set={
                    title:args.title ?? course.title,
                    description:args.description ?? course.description,
                    teacherId: teacId ?? course.teacherId
                }
                await context.coursecollection.updateOne({_id: new ObjectId(args.id)},
                {$set: set})

                if(teacId){
                    if(teacId !== teachAnt){
                    await context.teachercollection.updateOne({_id: teachAnt},
                     {$pull: {coursesTaught: course._id!}}   
                    )
                    await context.teachercollection.updateOne({_id: teacId},
                     {$push: {coursesTaught: course._id!}}
                    )
                    }
                }
                course=await context.coursecollection.findOne({_id:new ObjectId(args.id)})
                if(!course){
                    return null
                }
                return fromModelToCoursesMostrar(course,context.studentcollection,context.teachercollection)
            }
            return null
        },
        enrollStudentInCourse: async(_: unknown, args: {studentId: string, courseId: string},context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<CoursesMostrar | null> => {
            if(args.courseId && args.studentId){
                const estudiante = await context.studentcollection.findOne({_id: new ObjectId(args.studentId)})
                let curso = await context.coursecollection.findOne({_id: new ObjectId(args.courseId)})
                if(!estudiante || !curso){
                    return null
                }
                const estCurso = curso.studentsId
                const existen = estCurso.some((elem) => estudiante._id === elem)
                if(existen){
                    return fromModelToCoursesMostrar(curso,context.studentcollection,context.teachercollection)
                }
                await context.studentcollection.updateOne({_id: new ObjectId(args.studentId)},
                {$push: {enrolledCourses: new ObjectId(args.courseId)}})
                await context.coursecollection.updateOne({_id: new ObjectId(args.courseId)},
                {$push: {studentsId: new ObjectId(args.studentId)}})

                curso = await context.coursecollection.findOne({_id: new ObjectId(args.courseId)})
                if(!curso){
                    return null
                }
                return fromModelToCoursesMostrar(curso,context.studentcollection,context.teachercollection)
            }
            return null
        },
        removeStudentFromCourse: async(_: unknown, args: {studentId: string, courseId: string},context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<CoursesMostrar | null> => {
            if(args.courseId && args.studentId){
                const estudiante = await context.studentcollection.findOne({_id: new ObjectId(args.studentId)})
                let curso = await context.coursecollection.findOne({_id: new ObjectId(args.courseId)})
                if(!estudiante || !curso){
                    return null
                }
                await context.studentcollection.updateOne({_id: new ObjectId(args.studentId)},
                {$pull: {enrolledCourses: new ObjectId(args.courseId)}})
                await context.coursecollection.updateOne({_id: new ObjectId(args.courseId)},
                {$pull: {studentsId: new ObjectId(args.studentId)}})

                curso = await context.coursecollection.findOne({_id: new ObjectId(args.courseId)})
                if(!curso){
                    return null
                }
                return fromModelToCoursesMostrar(curso,context.studentcollection,context.teachercollection)
            }
            return null
        },
        deleteStudent: async(_:unknown,args:{id: string},context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<boolean>=> {
            if(args.id){
                const estudiante = await context.studentcollection.findOne({_id: new ObjectId(args.id)})
                if(!estudiante){
                    return false
                }
                const id = estudiante._id
                await context.studentcollection.deleteOne({_id: id})
                await context.coursecollection.updateMany({},
                {$pull: {studentsId: id}}
                )
                return true
            }
            return false
        },
        deleteTeacher: async(_:unknown, args: {id: string},context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<boolean> => {
            if(args.id){
                const teacher = await context.teachercollection.findOne({_id: new ObjectId(args.id)})
                if(!teacher){
                    return false
                }
                const id = teacher._id
                await context.teachercollection.deleteOne({_id: id})
                await context.coursecollection.updateMany({teacherId: id},
                    {$set: {teacherId: undefined}}
                )
                return true;
            }
            return false
        },
        deleteCourse: async(_:unknown, args: {id: string},context: {teachercollection:Collection<TeacherModel>,coursecollection:Collection<CoursesModel>,studentcollection:Collection<StudentModel>}):Promise<boolean> => {
            if(args.id){
                const curso = await context.coursecollection.findOne({_id: new ObjectId(args.id)})
                if(!curso){
                    return false
                }
                const id = curso._id
                await context.coursecollection.deleteOne({_id: id})
                await context.studentcollection.updateMany({},
                    {$pull: {enrolledCourses: id}}
                )
                await context.teachercollection.updateMany({},
                    {$pull: {coursesTaught: id}}
                )
                return true
            }
            return false
        }
    }
}