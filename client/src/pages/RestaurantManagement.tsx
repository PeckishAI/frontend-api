import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const priceBuckets = [
  { value: "budget", label: "Budget ($)" },
  { value: "moderate", label: "Moderate ($$)" },
  { value: "premium", label: "Premium ($$$)" },
  { value: "luxury", label: "Luxury ($$$$)" },
];

const paymentMethods = [
  { value: "stripe", label: "Stripe" },
  { value: "square", label: "Square" },
  { value: "paypal", label: "PayPal" },
  { value: "manual", label: "Manual Payment" },
];

const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  priceBucket: z.string(),
  paymentMethod: z.string(),
  paymentDetails: z.string().optional(),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

// Mock restaurant data
const mockRestaurant = {
  id: 1,
  name: "Main Restaurant",
  address: "123 Restaurant Street",
  phone: "(555) 123-4567",
  priceBucket: "moderate",
  paymentMethod: "stripe",
  paymentDetails: "",
};

// Mock multiple restaurants data
const mockRestaurants = [
  {
    id: 1,
    name: "Main Restaurant",
    address: "123 Restaurant Street",
    phone: "(555) 123-4567",
    priceBucket: "moderate",
    paymentMethod: "stripe",
    paymentDetails: "",
  },
  {
    id: 2,
    name: "Second Location",
    address: "456 Food Avenue",
    phone: "(555) 987-6543",
    priceBucket: "premium",
    paymentMethod: "square",
    paymentDetails: "",
  },
];

export default function RestaurantManagement() {
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof mockRestaurants[0] | null>(null);

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: selectedRestaurant || mockRestaurants[0],
  });

  const onSubmit = (data: RestaurantFormValues) => {
    // In a real app, we would save the restaurant data here
    console.log("Restaurant data:", data);
    
    toast({
      title: "Restaurant Updated",
      description: "Your restaurant information has been updated successfully.",
    });
    setSelectedRestaurant(null);
  };

  return (
    <div className="ml-64 p-8 w-full">
      <Card className="w-full">
        <CardHeader className="px-8">
          <CardTitle>Restaurant Management</CardTitle>
        </CardHeader>
        <CardContent className="px-8">
          <div className="space-y-4">
            {mockRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className={`hover:bg-accent/50 transition-colors cursor-pointer ${
                  selectedRestaurant?.id === restaurant.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {priceBuckets.find(b => b.value === restaurant.priceBucket)?.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {paymentMethods.find(m => m.value === restaurant.paymentMethod)?.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedRestaurant && (
            <div className="mt-8 border-t pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceBucket"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Bucket</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a price bucket" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priceBuckets.map((bucket) => (
                              <SelectItem key={bucket.value} value={bucket.value}>
                                {bucket.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setSelectedRestaurant(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
