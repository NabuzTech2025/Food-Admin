export const categoryColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-yellow-100 text-yellow-700",
];

export const tabColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
  "bg-gray-100 text-gray-700",
];

export const getCategoryColor = (category: string, index: number) => {
  return categoryColors[index % categoryColors.length];
};

// Helper function to get consistent color for tabs
export const getTabColor = (tab: string, index: number) => {
  return tabColors[index % tabColors.length];
};
