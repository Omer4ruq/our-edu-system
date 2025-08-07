import DateForm from "./DateForm";
import StuDateTable from "./StuDateTable";
export default function StuDateReport() {
  return (
    <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
      <DateForm />

      <StuDateTable />
    </div>
  );
}
