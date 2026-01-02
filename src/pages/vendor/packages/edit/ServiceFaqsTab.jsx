import React, { useState } from "react";
import { useAddServiceFaqMutation, useDeleteServiceFaqMutation } from "../../../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "../../../../components/ui/accordion";

const ServiceFaqsTab = ({ pkg }) => {
  const [addFaq, { isLoading: isAdding }] = useAddServiceFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteServiceFaqMutation();
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!question || !answer) {
      toast.error("Question and Answer are required");
      return;
    }

    try {
      await addFaq({ id: pkg._id, data: { question, answer } }).unwrap();
      toast.success("FAQ added successfully!");
      setIsDialogOpen(false);
      setQuestion("");
      setAnswer("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add FAQ");
    }
  };

  const handleDeleteFaq = async (index) => {
      // Simple confirm since it's just text
      if(!window.confirm("Remove this FAQ? This action cannot be undone.")) return;

    try {
      await deleteFaq({ id: pkg._id, index }).unwrap();
      toast.success("FAQ deleted successfully");
    } catch (error) {
        toast.error(error?.data?.message || "Failed to delete FAQ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 size-4" /> Add New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add FAQ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFaq} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input 
                  placeholder="e.g. Is advance payment required?" 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea 
                  placeholder="e.g. Yes, 30% advance..." 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add FAQ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pkg?.faqs?.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
          No FAQs added yet.
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
            {pkg?.faqs?.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <div className="flex items-center gap-2 w-full">
                        <AccordionTrigger className="flex-1 text-left hover:no-underline">
                            {faq.question}
                        </AccordionTrigger>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive h-8 w-8 mr-2"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent accordion toggle
                                handleDeleteFaq(index);
                            }}
                        >
                            <IconTrash className="size-4" />
                        </Button>
                    </div>
                    <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      )}
    </div>
  );
};

export default ServiceFaqsTab;
