import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Chip,
  Pagination,
} from "@heroui/react";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
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
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const savedTodos = sessionStorage.getItem("todos");
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
      };
      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      sessionStorage.setItem("todos", JSON.stringify(newTodos));
      setInputValue("");
    }
  };

  const handleDelete = (id: number) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
    if (!todoToDelete) return;

    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
    sessionStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const pages = Math.ceil(todos.length / rowsPerPage);

  const displayedTodos = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return todos.slice(start, end);
  }, [page, todos]);

  return (
    <div className="flex justify-center items-center min-h-screen p-5">
      <Card className="w-full lg:w-2/3 xl:w-2/4">
        <CardHeader className="flex justify-center text-4xl font-extrabold tracking-wider">
          TODO List
        </CardHeader>
        <CardBody className="flex flex-col">
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Enter a task"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            />
            <Button color="primary" onPress={handleAddTodo}>
              Add
              <PlusCircleIcon />
            </Button>
          </div>

          <div className="flex justify-between mb-4">
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
              sessionStorage.setItem("todos", JSON.stringify(newTodos));
            }}
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
