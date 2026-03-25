export type Department = {
  id: string;
  name: string;
};

export type Agent = {
  id: string;
  name: string;
  departmentId: string;
  systemPrompt: string;
};
