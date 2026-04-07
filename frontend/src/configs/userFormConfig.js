export const getUserFormFields = (isEdit = false) => {
  const fields = [
    { name: "full_name", label: "Full Name", type: "text", required: true },
    { name: "username", label: "Username", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "department", label: "Department", type: "text", required: false },
    { 
      name: "role", 
      label: "System Role", 
      type: "select", 
      required: true,
      options: [
        { value: "ADMIN", label: "Administrator" },
        { value: "RECEIVER", label: "Receiver Operator" },
        { value: "DISPATCHER", label: "Dispatcher Operator" }
      ]
    },
    { 
      name: "is_active", 
      label: "Active Account", 
      type: "checkbox", 
      required: false,
      defaultValue: true
    }
  ];

  if (!isEdit) {
    fields.push({ name: "password", label: "Initial Password", type: "password", required: true });
  }

  return fields;
};
