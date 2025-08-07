import VaccinationForm from './VaccinationForm';
import { Vaccination } from '@/types/database';

interface EditVaccinationButtonProps {
  vaccination: Vaccination;
}

const EditVaccinationButton = ({ vaccination }: EditVaccinationButtonProps) => {
  return <VaccinationForm vaccination={vaccination} isEdit={true} />;
};

export default EditVaccinationButton;