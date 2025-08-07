import { primaryColor, secondaryColor } from "./getTheme";

  

  
  
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    background: 'rgba(255, 255, 255, 0.2)',
    border: `2px solid ${state.isFocused ? primaryColor : 'rgba(157, 144, 135, 0.3)'}`,
    borderRadius: '12px',
        padding: '3px',
    minHeight: '50px',
    paddingLeft: '6px',
    boxShadow: state.isFocused ? `0 0 0 3px rgba(219, 158, 48, 0.1)` : 'none',
    '&:hover': {
      borderColor: primaryColor,
    },
  }),
  input: (provided) => ({
  ...provided,
  color: '#441a05fff', 
  fontSize: '16px',
}),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#441a05fff',
    fontSize: '16px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '16px',
  }),
  menuPortal: (base) => ({
  ...base,
  zIndex: 9999,
}),
  menu: (provided) => ({
    ...provided,
   background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected 
      ? primaryColor 
      : state.isFocused 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'transparent',
    color: '#441a05fff',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
       background: secondaryColor,
    color: '#441a05fff',
    },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: primaryColor,
    '&:hover': { 
      color: '#441a05fff',
    },
  }),
};


  export default selectStyles;