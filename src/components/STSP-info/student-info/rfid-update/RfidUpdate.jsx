import RfidForm from "./RfidForm";
import RfidTable from "./RfidTable";

export default function RfidUpdate() {
  return (
    <div className="bg-[#441a05]rounded-md px-4 py-2 my-2 sm:my-4">
      <RfidForm />

      <RfidTable />
    </div>
  )
}
