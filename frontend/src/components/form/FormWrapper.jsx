import React from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from './InputField';
import { Button } from '../common/Button';

import { ImageUploadField } from './ImageUploadField';

export function FormWrapper({ config, onSubmit, defaultValues = {}, submitLabel = "Submit", isLoading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.map((field) => {
          if (field.type === 'image') {
            return (
              <div key={field.name} className="md:col-span-2">
                <ImageUploadField
                  name={field.name}
                  label={field.label}
                  setValue={setValue}
                  currentValue={watch(field.name)}
                  error={errors[field.name]}
                />
              </div>
            );
          }
          
          return (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type}
              register={register}
              error={errors[field.name]}
              required={field.required !== false}
              options={field.options}
              defaultValue={field.defaultValue}
              {...field.props}
            />
          );
        })}
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
