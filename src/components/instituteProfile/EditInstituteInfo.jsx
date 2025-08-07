import { useTranslation } from "react-i18next";
import InstInfoForm from "./InstInfoForm";

export default function EditInstituteInfo() {
   const { t } = useTranslation();
    return (
        <div className="bg-[#441a05]p-6 md:py-7 md:px-10 rounded-md my-4">
         <h5 className=" text-textGray font-medium text-xl">{t("general.institute")} {t("general.information")}</h5>

         {/* main form */}
         <InstInfoForm />

        </div>
    );
}