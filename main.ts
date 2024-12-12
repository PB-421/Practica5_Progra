import{MongoClient}from "mongodb"
import{ApolloServer}from "@apollo/server"
import { schema } from "./squema.ts";
import { resolvers } from "./resolvers.ts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { CoursesModel, StudentModel, TeacherModel } from "./types.ts";
const MONGO_URL=Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  console.log("mongo url is not set")
  Deno.exit(1)
}
const client= new MongoClient(MONGO_URL)

await client.connect()

const db=client.db("Practica5")

const coursecollection=db.collection<CoursesModel>("Course")
const studentcollection=db.collection<StudentModel>("Student")
const teachercollection=db.collection<TeacherModel>("Teacher")

const server= new ApolloServer({
  typeDefs: schema,resolvers
})
const{url}=await startStandaloneServer(server,{
  listen:{port:8080},context: async () =>({coursecollection,studentcollection,teachercollection})
})
console.log(`Server running on: ${url}`);