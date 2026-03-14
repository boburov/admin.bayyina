// Components
import Select from "./Select";
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/shared/components/shadcn/field";

const SelectComponent = ({ ...props }) => {
  return <Select {...props} />;
};

const SelectField = ({
  id = "",
  name = "",
  label = "",
  className = "",
  description = "",
  selectClassName = "",
  ...props
}) => {
  return (
    <Field data-disabled={props.disabled} className={className}>
      {label && (
        <FieldLabel htmlFor={id || name} className="max-w-max">
          {label}
          {props.required && <span className="text-primary">*</span>}
        </FieldLabel>
      )}
      <SelectComponent
        name={name}
        id={id || name}
        className={selectClassName}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};

export default SelectField;
