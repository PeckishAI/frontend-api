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
import { useToast } from "@/hooks/use-toast";

const priceBuckets = [
  { value: "budget", label: "Budget ($)" },
  { value: "moderate", label: "Moderate ($$)" },
  { value: "premium", label: "Premium ($$$)" },
  { value: "luxury", label: "Luxury ($$$$)" },
];

const paymentMethods = [
  { value: "stripe", label: "Stripe", requiresSetup: true },
  { value: "square", label: "Square", requiresSetup: true },
  { value: "paypal", label: "PayPal", requiresSetup: true },
  { value: "manual", label: "Manual Payment", requiresSetup: false },
];

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  priceBucket: string;
  paymentMethod: string;
  paymentDetails: string;
  stripeAccountId?: string;
}

const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  priceBucket: z.string(),
  paymentMethod: z.string(),
  paymentDetails: z.string().optional(),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

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

// Placeholder for Stripe configuration component
const StripeConfig = ({ onSetupComplete, onCancel }: { onSetupComplete: (accountId: string) => void; onCancel: () => void }) => {
  // Replace with actual Stripe setup logic
  const [accountId, setAccountId] = useState('');
  const handleSetup = () => {
    // Simulate Stripe setup
    const simulatedAccountId = 'acct_XXXXXXXXXXXXXXX'; // Replace with actual Stripe account ID generation
    setAccountId(simulatedAccountId);
    onSetupComplete(simulatedAccountId);
  };
  return (
    <div>
      <p>Stripe Configuration Placeholder</p>
      <Button onClick={handleSetup}>Connect Stripe</Button>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
  );
};


export default function RestaurantManagement() {
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showStripeSetup, setShowStripeSetup] = useState(false);

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
    <div className="ml-64 p-8 w-full max-w-[1600px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Restaurants</h1>
          <Button>Add Restaurant</Button>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-sm font-medium leading-none text-muted-foreground">All restaurants</h2>
          <p className="text-sm text-muted-foreground">Manage your restaurant locations and their settings.</p>
        </div>

        <div className="space-y-4">
          {mockRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`group relative rounded-lg border border-border bg-card p-4 hover:bg-accent/5 transition-colors cursor-pointer ${
                selectedRestaurant?.id === restaurant.id ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-medium">{restaurant.name}</h3>
                    <div className="hidden group-hover:flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{restaurant.address}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <div className="flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {priceBuckets.find(b => b.value === restaurant.priceBucket)?.label}
                  </div>
                  <div className="flex items-center rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {paymentMethods.find(m => m.value === restaurant.paymentMethod)?.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedRestaurant && (
          <div className="mt-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-medium leading-none text-muted-foreground">Edit Restaurant</h2>
              <p className="text-sm text-muted-foreground">Update the information for {selectedRestaurant.name}.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
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
                        {field.value === "stripe" && !selectedRestaurant?.stripeAccountId && (
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowStripeSetup(true)}
                            >
                              Configure Stripe
                            </Button>
                          </div>
                        )}
                        {field.value === "stripe" && selectedRestaurant?.stripeAccountId && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Stripe account connected: {selectedRestaurant.stripeAccountId}
                          </div>
                        )}
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
                  {showStripeSetup && (
                    <div className="mt-6 p-4 border rounded-lg bg-muted">
                      <StripeConfig
                        onSetupComplete={(accountId) => {
                          setSelectedRestaurant(prev => 
                            prev ? { ...prev, stripeAccountId: accountId } : null
                          );
                          setShowStripeSetup(false);
                          toast({
                            title: "Stripe Connected",
                            description: "Successfully connected Stripe to this restaurant.",
                          });
                        }}
                        onCancel={() => setShowStripeSetup(false)}
                      />
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}