import AddTForm from "./AddTForm";
import AddTHeader from "./AddTHeader";

export default function AddTeacher() {
    return (
      <div className="my-4 bg-[#441a05]rounded-md p-4 md:p-6">
         <AddTHeader />

         <AddTForm />
      </div>
    );
}