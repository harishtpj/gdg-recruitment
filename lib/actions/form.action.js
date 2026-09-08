import FormDataModel from "@/lib/modals/form.modal";

export const submitFormAction = async (formData) => {
  try {
    const { Email, Department } = formData;
    const existingSubmissions = await FormDataModel.find({ Email });

    if (existingSubmissions.some((submission) => submission.Department === Department)) {
      return {
        success: false,
        status: 400,
        message: `You have already submitted an application for ${Department}`,
      };
    }

    if (existingSubmissions.length >= 2) {
      return {
        success: false,
        status: 400,
        message: "Remember that you can only submit upto 2 unique applications",
      };
    }

    await FormDataModel.create(formData);

    return {
      success: true,
      message: "Form submitted successfully!",
    };
  } catch (error) {
    return { success: false, status: 500, message: error.message };
  }
};
