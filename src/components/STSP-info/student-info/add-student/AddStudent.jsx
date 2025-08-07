import AddSForm from "./AddSForm";
import AddSHeader from "./AddSHeader";

export default function AddStudent() {
    return (
      <div className="my-4 bg-[#441a05]rounded-md p-4 md:p-6">
         <AddSHeader />

         <AddSForm />
      </div>
    );
}