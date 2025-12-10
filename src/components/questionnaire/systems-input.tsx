
"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatePresence, motion } from "framer-motion";

export function SystemsInput() {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "systems",
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Systems Involved</h3>
        <p className="text-sm text-muted-foreground">List the systems this process uses.</p>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {fields.map((item, index) => {
            const hasApi = watch(`systems.${index}.hasApi`);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 border rounded-lg bg-card space-y-4"
              >
                <div className="flex justify-between items-center">
                    <p className="font-medium">System #{index + 1}</p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`systems.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SAP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`systems.${index}.hasApi`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Does it have APIs?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Don't know">Don't know</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {hasApi === "No" && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                    <FormField
                      control={control}
                      name={`systems.${index}.isCloud`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is it cloud-based with SSO/username login?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: "", hasApi: "Yes", isCloud: "Yes" })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Another System
      </Button>
    </div>
  );
}

