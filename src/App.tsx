import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Chip,
  Pagination,
  DatePicker,
  Select,
  SelectItem,
} from "@heroui/react";
import { PlusCircleIcon, SearchIcon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { useState, useEffect } from "react";
import React from "react";

interface Todo {
  id: number;
  task: string;
  isComplete: boolean;
  dueDate: string;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        task: inputValue,
        isComplete: false,
        dueDate: dueDate || new Date().toISOString().split("T")[0],
      };
      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      localStorage.setItem("todos", JSON.stringify(newTodos));
      setInputValue("");
      setDueDate("");
    }
  };

  const handleDelete = (id: number) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
    if (!todoToDelete) return;

    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const pages = Math.ceil(todos.length / rowsPerPage);

  const filteredTodos = React.useMemo(() => {
    let filtered = todos;
    if (filter === "active") {
      filtered = todos.filter((todo) => !todo.isComplete);
    } else if (filter === "completed") {
      filtered = todos.filter((todo) => todo.isComplete);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((todo) =>
        todo.task.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [filter, searchQuery, todos]);

  const displayedTodos = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredTodos.slice(start, end);
  }, [page, filteredTodos]);

  return (
    <div className="flex justify-center items-center min-h-screen p-5">
      <Card className="w-full md:w-2/3">
        <CardHeader className="flex justify-center text-4xl font-extrabold tracking-wider my-5">
          TODO List
        </CardHeader>
        <CardBody className="flex flex-col">
          <div className="flex gap-3 mb-6 flex-col lg:flex-row flex-grow">
            <Input
              size="lg"
              placeholder="Enter a task"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            />
            <DatePicker
              size="lg"
              className="w-full lg:w-[200px]"
              onChange={(e) => setDueDate(e?.toString() ?? "-")}
            />
            <Button color="primary" size="lg" onPress={handleAddTodo}>
              <PlusCircleIcon />
            </Button>
          </div>

          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <span>Total Tasks</span>
              <Chip color="primary" variant="flat">
                {todos.length}
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <span>Remaining Tasks</span>
              <Chip color="warning" variant="flat">
                {todos.filter((todo) => !todo.isComplete).length}
              </Chip>
            </div>
          </div>

          <Table
            aria-label="Todo list with pagination"
            selectionMode="multiple"
            selectedKeys={todos
              .filter((todo) => todo.isComplete)
              .map((todo) => todo.id.toString())}
            onSelectionChange={(keys) => {
              const selectedIds = Array.from(keys).map(Number);
              const newTodos = todos.map((todo) => ({
                ...todo,
                isComplete: selectedIds.includes(todo.id),
              }));
              setTodos(newTodos);
              localStorage.setItem("todos", JSON.stringify(newTodos));
            }}
            topContentPlacement="outside"
            topContent={
              <div className="flex gap-3">
                <Input
                  placeholder="Search tasks"
                  size="lg"
                  value={searchQuery}
                  endContent={<SearchIcon />}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                  size="lg"
                  className="max-w-[180px]"
                  defaultSelectedKeys={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "all" | "active" | "completed")
                  }
                >
                  <SelectItem key="all">All</SelectItem>
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="completed">Completed</SelectItem>
                </Select>
              </div>
            }
            bottomContentPlacement="outside"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>NO</TableColumn>
              <TableColumn>TASK</TableColumn>
              <TableColumn>DUE DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {displayedTodos.map((todo, index) => (
                <TableRow key={todo.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <span
                      className={
                        todo.isComplete ? "line-through text-gray-400" : ""
                      }
                    >
                      {todo.task}
                    </span>
                  </TableCell>
                  <TableCell>{todo.dueDate}</TableCell>
                  <TableCell>
                    <Chip color={todo.isComplete ? "success" : "warning"}>
                      {todo.isComplete ? "Completed" : "Pending"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => handleDelete(todo.id)}
                    >
                      <Trash2Icon size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
