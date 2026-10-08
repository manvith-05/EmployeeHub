package employee.service;

import employee.entity.Department;
import employee.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public Department addDepartment(Department department) {
        return repository.save(department);
    }

    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Department updateDepartment(Long id, Department department) {
        Department existing = repository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(department.getName());
            existing.setDescription(department.getDescription());

            return repository.save(existing);
        }

        return null;
    }

    public void deleteDepartment(Long id) {
        repository.deleteById(id);
    }
}