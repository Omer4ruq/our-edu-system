import TimeForm from "../../TimeForm";
import FeeTable from "./FeeTable";
export default function DateWisePaidFee() {
  return (
    <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeForm />

      <FeeTable />
    </div>
  );
}
